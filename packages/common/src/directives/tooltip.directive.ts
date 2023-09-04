import { Directive, Input, HostListener, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { getPosition } from './utils';
import {  } from '../types/popup';import { TooltipComponent, calcTooltipBounds } from '../components/tooltip/tooltip.component';
import { TooltipOptions } from '../types/tooltip';

@Directive({
    selector: '[ngxTooltip],[ngx-tooltip]',
    providers: [
        MatDialog
    ],
    standalone: true
})
export class TooltipDirective {

    /**
     */
    @Input("ngxTooltip")
    @Input("ngx-tooltip") template: TemplateRef<any> | Type<any>;

    /**
     * Configuration for opening the app menu
     */
    @Input("ngxTooltipConfig")
    @Input("ngx-tooltip-config") config: TooltipOptions = {};

    /**
     * Arbitrary data to pass into the template
     */
    @Input("ngxTooltipContext")
    @Input("ngx-tooltip-context") data: any = {};


    private dialogInstance: MatDialogRef<any>;
    private isCursorOverTarget = false;
    private isFreezeOnKeyCodeBound = false;

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) {
        if (this.config.freezeOnKeyCode !== null) {
            this.isFreezeOnKeyCodeBound = true;
            document.body.addEventListener("keydown", this.onKeyDownEvt);
        }
    }

    ngOnDestroy() {
        if (this.isFreezeOnKeyCodeBound) {
            document.body.removeEventListener("keydown", this.onKeyDownEvt);
        }
    }

    onKeyDown(evt) {
        // TODO: fade message 'tooltip is locked open'
        if (evt.code == ("F2")) {
            this.dialogInstance.componentInstance.isLockedOpen = true;
        }
    }
    private onKeyDownEvt = this.onKeyDown.bind(this);

    // Needs to be public so we can manually open the dialog
    @HostListener('pointerenter', ['$event'])
    public async onPointerEnter(evt: PointerEvent) {
        // If the template is not a template ref, do nothing.
        if (!(this.template instanceof TemplateRef))
            return;

        // If the click trigger is set, we will immediately open the tooltip.
        // This will bypass all other triggers.
        if (this.config.triggers.includes("click")) {
            if (!this.dialogInstance) {
                const el = this.viewContainer.element.nativeElement;
                this.dialogInstance = await openTooltip(this.dialog, this.template, this.data, el, this.config);
            }
            return;
        }

        this.isCursorOverTarget = true;

        setTimeout(async () => {
            // If the cursor moved away in the time
            if (!this.isCursorOverTarget)
                return;

            if (!this.dialogInstance) {
                const el = this.viewContainer.element.nativeElement;
                this.dialogInstance = await openTooltip(this.dialog, this.template, this.data, el, this.config);
            }
        }, this.config.delay ?? 250);
    }

    @HostListener('pointerleave', ['$event'])
    public async onPointerLeave(evt: PointerEvent) {
        this.isCursorOverTarget = false;
    }
}

// Helper to open the context menu without using the directive.
export const openTooltip = async (
    dialog: MatDialog,
    template: TemplateRef<any> | Type<any>,
    data: any,
    el: HTMLElement,
    config?: TooltipOptions
) => {

    const rect = await calcTooltipBounds(template, data);
    const ownerCords = el.getBoundingClientRect();
    const cords = getPosition(el, config, rect);
    const specificId = crypto.randomUUID();

    return new Promise(res => {
        dialog.open(TooltipComponent, {
            data: {
                data: data,
                template: template,
                config: config,
                ownerCords: ownerCords,
                selfCords: cords,
                id: specificId
            },
            panelClass: ["ngx-tooltip", 'ngx-' + specificId].concat(config?.customClass || []),
            position: cords,
            hasBackdrop: false
        })
            .afterClosed()
            .subscribe(s => {
                res(s);
            })
    }) as Promise<any>;
};
