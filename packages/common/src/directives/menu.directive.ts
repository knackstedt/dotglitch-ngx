import { Directive, HostListener, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getPosition } from './utils';
import { MenuItem, MenuOptions } from '../types/menu';
import { MenuComponent, calcMenuItemBounds } from '../components/menu/menu.component';
import { ulid } from 'ulidx';
import { firstValueFrom } from 'rxjs';

@Directive({
    selector: '[ngx-contextmenu],[ngx-menu]',
    providers: [
        MatDialog
    ],
    standalone: true
})
export class MenuDirective {

    /**
     * The data representing the item the menu was opened for.
     */
    @Input("ngx-menu-context") data: any;

    /**
     * The items that will be bound to the context menu.
     */
    @Input("ngx-contextmenu") ctxMenuItems: MenuItem[];

    /**
     * The items that will be bound to the menu that pops
     * up when the user clicks the element.
     */
    @Input("ngx-menu") menuItems: MenuItem[];

    /**
     * Configuration for opening the app menu
     */
    @Input("ngx-menu-config") config: MenuOptions = {};

    private triggers: string[] = [];

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) { }

    ngOnInit() {
        this.ngOnChanges();
    }

    ngOnChanges() {

        if (this.config.trigger) {
            this.triggers = Array.isArray(this.config.trigger) ? this.config.trigger : [this.config.trigger];
        }
    }

    ngAfterViewInit() {
        // const el = this.viewContainer.element.nativeElement as HTMLElement;

        // // Automatically attach context menu items to
        // // the contextmenu event
        // if (this.ctxMenuItems) {
        //     el.addEventListener('contextmenu', (e) => {
        //         e.preventDefault();
        //         this.openMenu(e as any, this.ctxMenuItems, true);
        //     });
        // }

        // if (this.menuItems?.length > 0) {
        //     if (!this.config?.trigger) {
        //         el.addEventListener('click', (e) => {
        //             this.openMenu(e as any, this.menuItems, true);
        //         });
        //     }
        //     else {

        //         triggers.forEach(t => {
        //             if (["contextmenu", "click"].includes(t)) {
        //                 el.addEventListener(t, (e) => {
        //                     e.preventDefault();
        //                     this.openMenu(e as any, this.ctxMenuItems, true);
        //                 });
        //             }
        //             else {
        //                 el.addEventListener(t, this.openMenu.bind(this));
        //             }
        //         });
        //     }
        // }
    }

    async openMenu(evt: PointerEvent, items = this.menuItems, keepOpen = false) {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        el.classList.add("ngx-menu-open");

        const isCtxEvent = evt.button == 2;

        const config = structuredClone(this.config);
        config['_isLockedOpen'] = keepOpen;

        return openMenu(
            this.dialog,
            items,
            this.data,
            evt,
            this.config,
            isCtxEvent ? null : el
        )
            .then((...res) => {
                el.classList.remove("ngx-menu-open");
                return res;
            })
            .catch((ex) => {
                el.classList.remove("ngx-menu-open");
                throw ex;
            });
    }

    @HostListener("contextmenu", ['$event'])
    onCtxMenu(e) {
        if (this.ctxMenuItems || this.triggers.includes("contextmenu")) {
            e.preventDefault();
            this.openMenu(e as any, this.ctxMenuItems, true);
        }
    }

    @HostListener("click", ['$event'])
    onClick(e) {
        if (
            this.menuItems &&
            (
                this.triggers.length == 0 ||
                this.triggers.includes("click")
            )
        ) {
            e.preventDefault();
            this.openMenu(e as any, this.menuItems, true);
        }
    }

    @HostListener("dblclick", ['$event'])
    onDblClick(e) {
        if (
            this.menuItems && this.triggers.length == 0 ||
            this.menuItems && this.triggers.includes("dblclick")
        ) {
            e.preventDefault();
            this.openMenu(e as any, this.menuItems, true);
        }
    }
}

// Helper to open the menu without using the directive.
export const openMenu = async (
    dialog: MatDialog,
    menuItems: MenuItem[],
    data: any,
    evt: PointerEvent,
    config: MenuOptions = {},
    el?: HTMLElement
) => {
    // console.log({ dialog, menuItems, data, evt, config, el });

    evt.preventDefault();
    evt.stopPropagation();

    // Apply defaults.
    if (!config.alignment)
        config.alignment = "start";

    const initialBounds = await calcMenuItemBounds(menuItems, data);
    const cords = getPosition(el || evt, config, initialBounds);
    const specificId = ulid();

    return firstValueFrom(
        dialog.open(MenuComponent, {
            data: {
                dialog,
                data: data,
                ownerCords: el?.getBoundingClientRect(),
                selfCords: cords,
                items: menuItems,
                config: config,
                id: specificId,
                targetBounds: initialBounds
            },
            panelClass: ["ngx-menu", 'ngx-' + specificId].concat(config?.customClass || []),
            position: cords,
            backdropClass: "ngx-menu-backdrop"
        })
        .afterClosed());
};
