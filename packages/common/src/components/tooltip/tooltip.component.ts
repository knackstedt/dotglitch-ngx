import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { Component, HostListener, Inject, Input, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { Optional } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { TooltipOptions } from '../../types/tooltip';
import { MenuItem } from '../../types/menu';
import { MenuComponent } from '../menu/menu.component';

declare const Zone;
const zone = new Zone(Zone.current, { name: "@dotglitch_menu", properties: {} });

export const calcTooltipBounds = async (template: TemplateRef<any> | Type<any>, data: any, matDialogConfig: MatDialogConfig) => {

    const args = {
        data: data || {},
        template,
        config: {},
        selfCords: { left: "0px", top: "0px" },
        ownerCords: { x: 0, y: 0, width: 0, height: 0 },
        id: null
    }

    // dimensions should be in px... Might need to handle vw/v
    if (matDialogConfig?.width && matDialogConfig?.height) {
        return {
            width: parseInt(matDialogConfig.width),
            height: parseInt(matDialogConfig.height),
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        } as DOMRect;
    }

    return new Promise<DOMRect>((res, rej) => {
        zone.run(async () => {
            // Forcibly bootstrap the ctx menu outside of the client application's zone.
            const app = await createApplication({
                providers: [
                    { provide: MAT_DIALOG_DATA, useValue: args }
                ]
            });

            const del = document.createElement("div");
            del.style.position = "absolute";
            del.style.left = '-1000vw';
            document.body.append(del);

            const base = app.bootstrap(TooltipComponent, del);
            const { instance } = base;

            await firstValueFrom(app.isStable);

            const el: HTMLElement = instance.viewContainer?.element?.nativeElement;

            const rect = el.getBoundingClientRect();
            app.destroy();
            del.remove();

            res(rect)
        });
    })
}

@Component({
    selector: 'ngx-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss'],
    imports: [
        NgTemplateOutlet,
        NgComponentOutlet,
        MenuComponent
    ],
    standalone: true
})
export class TooltipComponent {
    @Input() data: any;
    @Input() config: TooltipOptions;
    @Input() ownerCords: DOMRect;
    @Input() selfCords;
    @Input() template: TemplateRef<any> | Type<any> | MenuItem[];

    public isTemplate = false;
    public isMenu = false;
    public hasBootstrapped = false;
    public pointerIsOnVoid = false;
    public isLockedOpen = false;

    clientWidth = window.innerWidth;
    clientHeight = window.innerHeight;

    coverRectCords = {
        top: 0,
        left: 0,
        height: 0,
        width: 0
    }

    constructor(
        public viewContainer: ViewContainerRef,
        @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
        @Optional() public dialog: MatDialog, // optional only for the purpose of estimating dimensions
        @Optional() public dialogRef: MatDialogRef<any>,
    ) {
        // Defaults are set before @Input() hooks evaluate
        this.data = this.data || this._data?.data || {};
        this.config = this.config || this._data?.config;
        this.dialog = this.dialog || this._data?.dialog;
        this.template = this.template || this._data?.template;
        this.ownerCords = this.ownerCords || this._data?.ownerCords;
        this.selfCords = this.selfCords || this._data?.selfCords;
        this.isLockedOpen = this._data?.isLockedOpen || this.config?.stayOpen;
    }

    ngOnInit() {

        const selfY = parseInt(this.selfCords.top.replace('px', ''));
        const selfX = parseInt(this.selfCords.left.replace('px', ''));

        this.coverRectCords = {
            top: this.ownerCords.y - selfY - 16,
            left: this.ownerCords.x - selfX - 16,
            height: this.ownerCords.height + 32,
            width: this.ownerCords.width + 32
        }

        if (Array.isArray(this.template))
            this.isMenu =  true;
        else if (this.template instanceof TemplateRef)
            this.isTemplate = true;
        else if (typeof this.template == "function")
            this.isTemplate = false;
        else
            throw new Error("Unrecognized template object provided.");

        // TODO: resolve the event hook with the .void element
        setTimeout(() => {
            this.hasBootstrapped = true;
            if (this.pointerIsOnVoid && !this.isLockedOpen)
                this.dialogRef.close();
        }, 200);
    }

    ngAfterViewInit() {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        el.addEventListener("keydown", evt => {
            this.isLockedOpen = true;
        });

        el.addEventListener("pointerdown", evt => {
            this.isLockedOpen = true;
        });

        el.addEventListener("touch", evt => {
            this.isLockedOpen = true;
        });
    }

    @HostListener("window:keydown", ['$event'])
    onKeyDown(evt: KeyboardEvent) {
        if (this.config?.freezeOnKeyCode) {
            if (evt.code == this.config.freezeOnKeyCode)
                this.isLockedOpen = true;
        }
    }

    onVoidPointerDown(evt: PointerEvent) {
        if (!this.isLockedOpen) {
            const el = this.viewContainer.element.nativeElement as HTMLElement;
            el.querySelector(".void").remove();

            setTimeout(() => {
                const clonedEvt = new PointerEvent("pointerdown", evt);
                const target = document.elementFromPoint(evt.clientX, evt.clientY) as HTMLElement;

                console.log("DEBUG EVENTS", {evt, clonedEvt});
                target.dispatchEvent(clonedEvt);
            }, 15)
        }

        this.closeOnVoid(true)
    }

    // If the void element gets stuck open, make wheel events pass through.
    onWheel(evt: WheelEvent) {
        const el = this.viewContainer.element.nativeElement as HTMLElement;
        el.style.display = "none";
        const target = document.elementFromPoint(evt.clientX, evt.clientY);
        el.style.display = "block";

        target.scroll({
            top: evt.deltaY + target.scrollTop,
            left: evt.deltaX + target.scrollLeft,
            behavior: "smooth"
        });
    }

    /**
     * Close the tooltip if these actions occur
     */
    @HostListener("window:resize")
    @HostListener("window:blur")
    @HostListener("pointerleave")
    private onClose() {
        if (!this.isLockedOpen)
            this.dialogRef?.close();

        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
    }

    closeOnVoid(force = false) {
        if (!this.isLockedOpen || force)
            this.dialogRef.close();
    }
}
