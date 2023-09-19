import { Directive, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getPosition } from './utils';
import { MenuItem, MenuOptions } from '../types/menu';
import { MenuComponent, calcMenuItemBounds } from '../components/menu/menu.component';

@Directive({
    selector: '[ngx-contextmenu],[ngx-menu],[ngxContextmenu],[ngxMenu]',
    providers: [
        MatDialog
    ],
    standalone: true
})
export class MenuDirective {

    /**
     * The data representing the item the menu was opened for.
     */
    @Input("ngxMenuContext")
    @Input("ngx-menu-context") data: any;

    /**
     * The items that will be bound to the context menu.
     */
    @Input("ngxContextmenu")
    @Input("ngx-contextmenu") ctxMenuItems: MenuItem[];

    /**
     * The items that will be bound to the menu that pops
     * up when the user clicks the element.
     */
    @Input("ngxMenu")
    @Input("ngx-menu") menuItems: MenuItem[];

    /**
     * Configuration for opening the app menu
     */
    @Input("ngxMenuConfig")
    @Input("ngx-menu-config") config: MenuOptions = {};

    constructor(
        private dialog: MatDialog,
        private viewContainer: ViewContainerRef
    ) { }

    ngAfterViewInit() {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        // Automatically attach context menu items to
        // the contextmenu event
        if (this.ctxMenuItems) {
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.openMenu(e as any, this.ctxMenuItems);
            });
        }

        if (this.menuItems?.length > 0) {
            if (!this.config?.trigger) {
                el.addEventListener('click', this.openMenu.bind(this));
            }
            else {
                const triggers = Array.isArray(this.config.trigger) ? this.config.trigger : [this.config.trigger];

                triggers.forEach(t => {
                    if (t == "contextmenu") {
                        el.addEventListener(t, (e) => {
                            e.preventDefault();
                            this.openMenu(e as any, this.ctxMenuItems);
                        });
                    }
                    else {
                        el.addEventListener(t, this.openMenu.bind(this));
                    }
                });
            }
        }
    }

    async openMenu(evt: PointerEvent, items = this.menuItems) {
        const el = this.viewContainer.element.nativeElement as HTMLElement;

        el.classList.add("ngx-menu-open");

        const isCtxEvent = evt.button == 2;

        return openMenu(this.dialog, items, this.data, evt, this.config, isCtxEvent ? null : el)
            .then((...res) => {
                el.classList.remove("ngx-menu-open");
                return res;
            })
            .catch((ex) => {
                el.classList.remove("ngx-menu-open");
                throw ex;
            });
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

    const cords = getPosition(el || evt, config, await calcMenuItemBounds(menuItems, data));
    const specificId = crypto.randomUUID();

    return new Promise(res => {
        dialog.open(MenuComponent, {
            data: {
                data: data,
                items: menuItems,
                config: config,
                id: specificId
            },
            panelClass: ["ngx-menu", 'ngx-' + specificId].concat(config?.customClass || []),
            position: cords,
            backdropClass: "ngx-menu-backdrop"
        })
        .afterClosed()
        .subscribe(s => {
            res(s);
        })
    }) as Promise<any>;
};
