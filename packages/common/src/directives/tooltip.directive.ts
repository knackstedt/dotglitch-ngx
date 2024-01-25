import { Directive, Input, HostListener, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { getPosition } from './utils';
import { TooltipComponent, calcTooltipBounds } from '../components/tooltip/tooltip.component';
import { TooltipOptions } from '../types/tooltip';
import { ulid } from 'ulidx';

@Directive({
    selector: '*[ngxTooltip],*[ngx-tooltip]',
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

    private isCursorOverTarget = false;
    private dialogIsOpen = false;

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) {
    }

    ngAfterViewInit() {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        this.config?.triggers?.forEach(t => {
            el.addEventListener(t, () => {
                if (t == "click")
                    this.config.stayOpen = true;

                this.open();
            })
        })
    }

    async open() {
        if (!this.dialogIsOpen) {
            const el = this.viewContainer.element.nativeElement;
            this.dialogIsOpen = true;
            await openTooltip(this.dialog, this.template, this.data, el, this.config);
            this.dialogIsOpen = false;
        }
    }

    @HostListener('pointerenter', ['$event'])
    public async onPointerEnter(evt: PointerEvent) {
        // If the template is not a template ref, do nothing.
        if (!(this.template instanceof TemplateRef))
            return;

        if (Array.isArray(this.config?.triggers) && !this.config.triggers.includes("hover")) {
            return;
        }

        this.isCursorOverTarget = true;

        setTimeout(async () => {
            // If the cursor moved away in the time
            if (!this.isCursorOverTarget)
                return;

            this.open();
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
    config?: TooltipOptions,
    focusTrap = false,
    matPopupOptions?: MatDialogConfig<any>
) => {

    const rect = await calcTooltipBounds(template, data, matPopupOptions);
    const ownerCords = el.getBoundingClientRect();
    const cords = getPosition(el, config, rect);
    const specificId = ulid();

    return new Promise(res => {
        dialog.open(TooltipComponent, {
            autoFocus: focusTrap,
            restoreFocus: focusTrap,
            data: {
                dialog,
                data: data,
                template: template,
                config: config,
                matPopupOptions,
                ownerCords: ownerCords,
                selfCords: cords,
                id: specificId
            },
            panelClass: ["ngx-tooltip", 'ngx-' + specificId].concat(config?.customClass || []),
            position: cords,
            hasBackdrop: false,
            ...matPopupOptions
        })
            .afterClosed()
            .subscribe(s => {
                res(s);
            })
    }) as Promise<any>;
};
