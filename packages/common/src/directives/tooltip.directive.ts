import { Directive, Input, HostListener, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { getPosition } from './utils';
import { TooltipComponent, calcTooltipBounds } from '../components/tooltip/tooltip.component';
import { TooltipOptions } from '../types/tooltip';
import { ulid } from 'ulidx';

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
            window.addEventListener("keydown", this.onKeyDownEvt);
        }
    }

    ngAfterViewInit() {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        this.config?.triggers?.forEach(t => {
            el.addEventListener(t, () => {
                this.open();
            })
        })
    }

    ngOnDestroy() {
        if (this.isFreezeOnKeyCodeBound) {
            window.removeEventListener("keydown", this.onKeyDownEvt);
        }
    }

    onKeyDown(evt) {
        // TODO: fade message 'tooltip is locked open'
        if (evt.code == ("F2")) {
            this.dialogInstance.componentInstance.isLockedOpen = true;
        }
    }
    private onKeyDownEvt = this.onKeyDown.bind(this);

    async open() {
        if (!this.dialogInstance) {
            const el = this.viewContainer.element.nativeElement;
            this.dialogInstance = await openTooltip(this.dialog, this.template, this.data, el, this.config);
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
