import { Directive, Input, HostListener, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { getPosition } from './utils';
import { TooltipComponent, calcTooltipBounds } from '../components/tooltip/tooltip.component';
import { TooltipOptions } from '../types/tooltip';
import { MenuItem, MenuOptions } from '../types/menu';
import { ulid } from 'ulidx';
import { firstValueFrom } from 'rxjs';
import { MenuComponent } from '../components/menu/menu.component';

@Directive({
    selector: '[ngx-tooltip]',
    providers: [
        MatDialog
    ],
    standalone: true
})
export class TooltipDirective {

    /**
     */
    @Input("ngx-tooltip") template: TemplateRef<any> | Type<any> | MenuItem[];

    /**
     * Configuration for opening the app menu
     */
    @Input("ngx-tooltip-config") config: TooltipOptions = {};

    /**
     * Arbitrary data to pass into the template
     */
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
    template: TemplateRef<any> | Type<any> | MenuItem[],
    data: any,
    el: HTMLElement,
    config?: TooltipOptions,
    focusTrap = false,
    matPopupOptions?: MatDialogConfig<any>
) => {

    const component = Array.isArray(template) ? MenuComponent : template;
    const rect = await calcTooltipBounds(component, data, matPopupOptions);
    const ownerCords = el.getBoundingClientRect();
    const cords = getPosition(el, config, rect);
    const specificId = ulid();

    return firstValueFrom(
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
    );
};

@Directive({
    selector: '[ngx-dropdown],[ngx-dropdown-config]',
    providers: [
        MatDialog
    ],
    standalone: true
})
export class DropdownDirective extends TooltipDirective {
    /**
     * The items that will be bound to the menu that pops
     * up when the user clicks the element.
     */
    @Input("ngx-dropdown") override template: TemplateRef<any> | Type<any> | MenuItem[];

    /**
     * Configuration for opening the app menu
     */
    @Input("ngx-dropdown-config") _config: TooltipOptions = {};

    ngOnInit() {
        // Set default values
        this._config.position = this._config.position ?? "bottom";
        this._config.alignment = this._config.alignment ?? "start";
        this._config.stayOpen = this._config.stayOpen ?? true;

        this.config = this._config;
    }
}
