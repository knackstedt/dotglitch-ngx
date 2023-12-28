import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Input, OnInit, Optional, Output, TemplateRef, Type, ViewContainerRef, isDevMode } from '@angular/core';
import { DomSanitizer, createApplication } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { firstValueFrom } from 'rxjs';
import { MenuItem, MenuOptions } from '../../types/menu';
import { TooltipDirective } from '../../directives/tooltip.directive';

export const calcMenuItemBounds = async (menuItems: MenuItem[], dataObj: any) => {
    const data = {
        data: dataObj,
        items: menuItems,
        config: {},
        selfCords: { left: "0px", top: "0px" },
        ownerCords: { x: 0, y: 0, width: 0, height: 0 },
        id: null
    }

    return calcComponentBounds(MenuComponent, data);
}

const calcComponentBounds = async (component: Type<any>, data: any) => {
    // Forcibly bootstrap the ctx menu outside of the client application's zone.
    const app = await createApplication({
        providers: [
            { provide: MAT_DIALOG_DATA, useValue: data }
        ]
    });

    const del = document.createElement("div");
    del.style.position = "absolute";
    del.style.left = '-1000vw';
    document.body.append(del);

    const base = app.bootstrap(component, del);
    const { instance } = base;

    await firstValueFrom(app.isStable);

    const el: HTMLElement = instance.viewContainer?.element?.nativeElement;

    const rect = el.getBoundingClientRect();
    app.destroy();
    del.remove();
    return rect;
}

const $data = Symbol("data");
const $hover = Symbol("hover");

@Component({
    selector: 'ngx-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    imports: [
        NgIf,
        NgForOf,
        NgTemplateOutlet,
        PortalModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TooltipDirective
    ],
    standalone: true
})
export class MenuComponent implements OnInit {
    @Input() public data: any;
    @Input() public items: MenuItem[];
    @Input() public config: MenuOptions;
    @Input() public id: string;
    @Input() public overlayOverlap = 32;
    @Input() public hoverDelay = 300;
    @Input() public showDebugOverlay = false;

    @Input() ownerCords: DOMRect;
    @Input() selfCords;
    @Input() parentItem;
    @Input() parentContext;

    public hasBootstrapped = false;
    public pointerIsOnVoid = false;
    public isLockedOpen = false;
    public pointerHasBeenOverMask = false;

    coverRectCords = {
        top: 0,
        left: 0,
        height: 0,
        width: 0
    }

    // Check if there are any slashes or dots -- that will clearly exclude it from being a mat icon
    public readonly matIconRx = /[\/\.]/i;
    showIconColumn = true;
    showShortcutColumn = true;

    template: TemplateRef<any>;
    templateType: "template" | "component";
    componentPortal: ComponentPortal<any>;
    private childDialogs: MatDialogRef<any>[] = [];

    constructor(
        public viewContainer: ViewContainerRef,
        public sanitizer: DomSanitizer,
        @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
        @Optional() public dialog: MatDialog, // optional only for the purpose of estimating dimensions
        @Optional() public dialogRef: MatDialogRef<any>
    ) {
        // Defaults are set before @Input() hooks evaluate
        this.dialog = this.dialog || this._data?.dialog;
        this.data  = this._data?.data;
        this.ownerCords = this._data?.ownerCords;
        this.selfCords = this._data?.selfCords;
        this.items = this._data?.items;
        this.config = this._data?.config;
        this.id = this._data?.id;
        this.parentItem = this._data?.parentItem;
        this.parentContext = this._data?.parentContext;

        this.template = _data.template;

        this.templateType = this.template instanceof TemplateRef ? "template" : "component";

        if (this.templateType == "component") {
            this.componentPortal = new ComponentPortal(this.template as any);
        }
    }

    ngOnInit() {

        this.items?.forEach(i => {
            if (typeof i == "string") return;

            // Set defaults
            i['_disabled'] = false;
            i['_visible'] = true;
            i['_context'] = (typeof i.context == "function")
                          ? i.context(this.data)
                          : i.context;

            if (i.label)
                try { i['_formattedLabel'] = this.formatLabel(i.label); } catch (e) { console.warn(e) }

            if (typeof i.isDisabled == "function")
                try { i['_disabled'] = i.isDisabled(this.data || {}, i['_context']); } catch(e) { console.warn(e) }

            if (typeof i.isVisible == "function")
                try { i['_visible'] = i.isVisible(this.data || {}, i['_context']); } catch (e) { console.warn(e) }

            if (typeof i.linkTemplate == "function")
                try { i['_link'] = i.linkTemplate(this.data || {}, i['_context']); } catch (e) { console.warn(e) }
        });

        // Show the icon column if there are any items with an icon
        this.showIconColumn = !!this.items?.find(i =>
                typeof i == "object" &&
                typeof i['icon'] == "string" &&
                i['icon'].length > 2
            );

        this.showShortcutColumn = !!this.items?.find(i =>
                typeof i == "object" &&
                typeof i['shortcut'] == "string" &&
                i['shortcut'].length > 2
            );

        if (this.ownerCords) {
            const selfY = parseInt(this.selfCords.top?.replace('px', '') || '0');
            const selfX = parseInt(this.selfCords.left?.replace('px', '') || '0');

            this.coverRectCords = {
                top: this.ownerCords.y - selfY - (this.overlayOverlap/2),
                left: this.ownerCords.x - selfX - (this.overlayOverlap/2),
                height: this.ownerCords.height + this.overlayOverlap,
                width: this.ownerCords.width + this.overlayOverlap
            }
        }

        setTimeout(() => {
            this.hasBootstrapped = true;
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

    ngOnDestroy() {
        //
        this.childDialogs.forEach(d => d.close({[$data]: true}))
    }

    /**
     *
     * @param item
     * @param evt
     * @returns
     */
    async onMenuItemClick(item: MenuItem, row: HTMLTableRowElement) {
        if (typeof item == 'string') return null;
        if (item.separator) return null;

        const context = await item['_context'];

        // If cache is enabled, only load if we don't have any children.
        const forceLoad = (item.cacheResolvedChildren ? !item.children : true);

        if (item.childrenResolver && forceLoad) {
            item['_isResolving'] = true;
            item['_children'] = await item.childrenResolver(this.data, context);
            item['_isResolving'] = false;
        }
        else if (typeof item.children == "function" && forceLoad) {
            item['_isResolving'] = true;
            item['_children'] = await item.children(this.data, context);
            item['_isResolving'] = false;
        }
        else {
            item['_children'] = item.children;
        }

        if (item['_children'] || item.childTemplate)
            row['_open'] = true;

        if (!item.childTemplate && !item.children) {
            if (typeof item.action == "function") {
                const res = await item.action(this.data, context)
                this.close(res);
                return res;
            }

            // If no action, this is simply a text item.
            return null;
        }

        // Need X pos, Y pos, width and height
        const bounds = row.getBoundingClientRect();

        const cords = {
            top: null,
            left: null,
            bottom: null,
            right: null
        };

        // Set position coordinates
        const { width, height } = await (item.childTemplate
            ? calcComponentBounds(MenuComponent, { template: item.childTemplate })
            : calcMenuItemBounds(item['_children'], this.data));

        if (bounds.y + height > window.innerHeight)
            cords.bottom = "0px";
        if (bounds.x + bounds.width + width > window.innerWidth)
            cords.left = ((bounds.x - width)) + "px";

        if (!cords.bottom) cords.top  = bounds.y + "px";
        if (!cords.left)   cords.left = bounds.x + bounds.width + "px";

        const dialogRef = this.dialog.open(MenuComponent, {
            position: cords,
            panelClass: ["ngx-menu"].concat(this.config?.customClass || []),
            backdropClass: "ngx-menu-backdrop",
            hasBackdrop: false,
            data: {
                data: this.data,
                ownerCords: row.getBoundingClientRect(),
                selfCords: cords,
                parentItem: item,
                parentContext: context,
                items: item['_children'],
                template: item.childTemplate,
                config: this.config
            }
        });

        let _s = dialogRef
            .afterClosed()
                .subscribe(async (result) => {
                    // Clicked "void" on a submenu
                    if (typeof result == "object" && result[$data] == true) {
                        this.close(result);
                    }
                    // Went back to parent menu -- do not close (same as result == null)
                    else if (typeof result == "object" && result[$data] == false) {

                    }
                    // Got some other result value
                    else if (result != null) {
                        // Perform action callback
                        if (typeof item.action == 'function') {
                            this.close(await item.action(result, context));
                        }
                        // Just close.
                        else {
                            this.close();
                        }
                    }

                    row['_open'] = false;

                    this.childDialogs.splice(this.childDialogs.indexOf(dialogRef), 1);

                    _s.unsubscribe();
                });

        this.childDialogs.push(dialogRef);
        return dialogRef;
    }

    /**
     *
     * @param label
     * @returns
     */
    formatLabel(label: string): string {
        return label.replace(/_([a-z0-9])_/i, (match, group) => `<u>${group}</u>`);
    }

    /**
     * Close the context menu under these circumstances
     */
    // @HostListener("window:resize", ['event'])
    // @HostListener("window:blur", ['event'])
    close(result?) {
        this.childDialogs.forEach(d => d.close())
        this.dialogRef?.close(result);
    }

    closeOnVoid(force = false) {
        if (!this.isLockedOpen || force) {
            this.close({[$data]: force});
        }
    }

    startHoverTimer(item, row) {

        // Invert check to make the logic simpler
        // TL;DR: if (any) of these are true, we will do the hover action
        if (!(
            Array.isArray(item.children) && item.children.length > 0 ||
            typeof item.children == "function" ||
            item.childTemplate ||
            item.childrenResolver
        ))
            return;

        item[$hover] = setTimeout(() => {
            delete item[$hover];

            if (!this.pointerIsOnVoid) {
                row['_open'] = true;
                this.onMenuItemClick(item, row);
            }
        }, this.hoverDelay);
    }
    stopHoverTimer(item) {
        item[$hover] && clearTimeout(item[$hover]);
        delete item[$hover];
    }

    /**
     * Check if the dialog is clipping offscreen
     * if so, move it back into view.
     */
    @HostListener("window:resize")
    private onResize() {
        const el = this.viewContainer?.element?.nativeElement as HTMLElement;
        if (!el) return;

        const { width, height, x, y } = el.getBoundingClientRect();

        const target = document.querySelector(".ngx-menu") as HTMLElement;
        if (!target) return;

        // Move back into view if we're clipping outside of the bottom
        if (y + height > window.innerHeight) {
            const newTop = (window.innerHeight - (height + (this.config.edgePadding || 12))) + "px";
            target.style['margin-top'] = newTop;
        }

        // Move back into view if we're clipping off the right
        if (x + width > window.innerWidth) {
            const newLeft = (window.innerWidth - (width + (this.config.edgePadding || 12))) + "px"
            target.style['margin-left'] = newLeft;
        }
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
        })
    }
}
