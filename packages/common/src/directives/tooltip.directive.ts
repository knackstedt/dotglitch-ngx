import { Directive, Input, HostListener, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { getPosition } from './utils';
import { PopupOptions } from '../types/popup';
import { TooltipComponent, calcTooltipBounds } from '../components/tooltip/tooltip.component';

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
    @Input("ngx-tooltip-config") config: PopupOptions = {};

    /**
     * Arbitrary data to pass into the template
     */
    @Input("ngxTooltipContext")
    @Input("ngx-tooltip-context") data: any = {};

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) {
    }

    ngOnInit() {
    }

    private dialogInstance: MatDialogRef<any>;

    // Needs to be public so we can manually open the dialog
    @HostListener('pointerenter', ['$event'])
    public async onPointerEnter(evt: PointerEvent) {
        // If the template is not a template ref, do nothing.
        if (!(this.template instanceof TemplateRef))
            return;

        const el = this.viewContainer.element.nativeElement;
        this.dialogInstance = await openTooltip(this.dialog, this.template, this.data, el, this.config);
    }
}

// Helper to open the context menu without using the directive.
export const openTooltip = async (
    dialog: MatDialog,
    template: TemplateRef<any> | Type<any>,
    data: any,
    el: HTMLElement,
    config?: PopupOptions
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
