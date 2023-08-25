import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, Input, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Optional } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { PopupOptions } from '../../types/popup';

export const calcTooltipBounds = async (template: TemplateRef<any> | Type<any>, data: any) => {
    const args = {
        data: data || {},
        template,
        config: {},
        selfCords: { left: "0px", top: "0px" },
        ownerCords: { x: 0, y: 0, width: 0, height: 0 },
        id: null
    }
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

    return rect;
}


@Component({
    selector: 'ngx-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss'],
    imports: [
        // NgIf,
        // NgTemplateOutlet,
        // NgComponentOutlet,
        CommonModule,
    ],
    standalone: true
})
export class TooltipComponent {
    @Input() data: any;
    @Input() config: PopupOptions;
    @Input() ownerCords: DOMRect;
    @Input() selfCords;
    @Input() template: TemplateRef<any> | Type<any>;

    public isTemplate: boolean;
    public hasBootstrapped = false;
    public pointerIsOnVoid = false;
    public isLockedOpen = false;

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
        this.template = this.template || this._data?.template;
        this.ownerCords = this.ownerCords || this._data?.ownerCords;
        this.selfCords = this.selfCords || this._data?.selfCords;
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

        if (this.template instanceof TemplateRef)
            this.isTemplate = true;
        else if (typeof this.template == "function")
            this.isTemplate = false;
        else
            throw new Error("Unrecognized template object provided.");

        // TODO: resolve the event hook with the .void element
        setTimeout(() => {
            this.hasBootstrapped = true;
            if (this.pointerIsOnVoid)
                this.dialogRef.close();
        }, 200);
    }

    /**
     * Close the tooltip if these actions occur
     */
    @HostListener("window:resize")
    @HostListener("window:blur")
    private onClose() {
        this.dialogRef?.close();
    }

    @HostListener("pointerleave")
    private onPointerLeave() {
        this.dialogRef?.close();
    }

    closeOnVoid() {
        console.log("fuck you")
        this.dialogRef.close();
    }
}
