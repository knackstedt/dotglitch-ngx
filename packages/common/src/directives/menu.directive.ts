import { Directive, Input, ViewContainerRef, SecurityContext } from '@angular/core';
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
                this.openMenu(e as any, this.ctxMenuItems, true);
            });
        }

        if (this.menuItems?.length > 0) {
            if (!this.config?.trigger) {
                el.addEventListener('click', (e) => {
                    this.openMenu(e as any, this.menuItems, true);
                });
            }
            else {
                const triggers = Array.isArray(this.config.trigger) ? this.config.trigger : [this.config.trigger];

                triggers.forEach(t => {
                    if (["contextmenu", "click"].includes(t)) {
                        el.addEventListener(t, (e) => {
                            e.preventDefault();
                            this.openMenu(e as any, this.ctxMenuItems, true);
                        });
                    }
                    else {
                        el.addEventListener(t, this.openMenu.bind(this));
                    }
                });
            }
        }
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
