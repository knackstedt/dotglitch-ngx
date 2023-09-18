import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Input, OnInit, Optional, Output, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { DomSanitizer, createApplication } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { firstValueFrom } from 'rxjs';
import { MenuItem, MenuOptions } from '../../types/menu';

export const calcMenuItemBounds = async (menuItems: MenuItem[], dataObj: any) => {
    const data = {
        data: dataObj,
        items: menuItems,
        config: {},
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

@Component({
    selector: 'ngx-menu-template-wrapper',

    template: `
    <ng-container *ngIf="templateType == 'template'; else portalOutlet">
        <ng-container
            [ngTemplateOutlet]="template"
            [ngTemplateOutletContext]="{ '$implicit': data, dialog: dialogRef }"
        />
    </ng-container>
    <ng-template #portalOutlet [cdkPortalOutlet]="componentPortal" ></ng-template>
`,
    imports: [ NgTemplateOutlet, PortalModule, NgIf ],
    standalone: true
})
class TemplateWrapper {

    data: Object;
    template: TemplateRef<any>;

    templateType: "template" | "component"
    componentPortal: ComponentPortal<any>;

    constructor(
        @Optional() public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        public viewContainer: ViewContainerRef
    ) {
        this.data = _data.data;
        this.template = _data.template;

        // TODO: This is probably invalid
        this.templateType = this.template instanceof TemplateRef ? "template" : "component";

        if (this.templateType == "component") {
            this.componentPortal = new ComponentPortal(this.template as any);
        }
    }
}

@Component({
    selector: 'ngx-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    imports: [
        NgIf,
        NgForOf,
        NgTemplateOutlet,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    standalone: true
})
export class MenuComponent implements OnInit {
    @Input() public data: any;
    @Input() public parentCords: DOMRect;
    @Input() public items: MenuItem[];
    @Input() public config: MenuOptions;
    @Input() public id: string;

    @Output() closeSignal = new EventEmitter();

    selfCords: DOMRect;
    // Check if there are any slashes or dots -- that will clearly exclude it from being a mat icon
    public readonly matIconRx = /[\/\.]/i;
    showIconColumn = true;
    showShortcutColumn = true;

    constructor(
        public viewContainer: ViewContainerRef,
        public sanitizer: DomSanitizer,
        @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
        @Optional() public dialog: MatDialog, // optional only for the purpose of estimating dimensions
        @Optional() public dialogRef: MatDialogRef<any>,
        private changeDetector: ChangeDetectorRef
    ) {
        // Defaults are set before @Input() hooks evaluate
        this.data  = this._data?.data;
        this.parentCords  = this._data?.parentCords;
        this.items = this._data?.items;
        this.config = this._data?.config;
        this.id = this._data?.id;
    }

    ngOnInit() {
        this.items?.forEach(i => {
            if (typeof i == "string") return;

            // Set defaults
            i['_disabled'] = false;
            i['_visible'] = true;

            if (i.label)
                try { i['_formattedLabel'] = this.formatLabel(i.label); } catch (e) { console.warn(e) }

            if (typeof i.isDisabled == "function")
                try { i['_disabled'] = i.isDisabled(this.data || {}); } catch(e) { console.warn(e) }

            if (typeof i.isVisible == "function")
                try { i['_visible'] = i.isVisible(this.data || {}); } catch (e) { console.warn(e) }

            if (typeof i.linkTemplate == "function")
                try { i['_link'] = i.linkTemplate(this.data || {}); } catch (e) { console.warn(e) }
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

        // setTimeout(() => {
        //     this.closeOnLeave = true
        // }, 300);
    }

    ngAfterViewInit() {
        if (this.parentCords) {
            this.selfCords = this.viewContainer?.element?.nativeElement?.getBoundingClientRect();
            this.changeDetector.detectChanges();
        }
    }

    /**
     *
     * @param item
     * @param evt
     * @returns
     */
    async onMenuItemClick(item: MenuItem, row: HTMLTableRowElement, hideBackdrop = false) {
        if (typeof item == 'string') return null;
        if (item.separator) return null;

        // If cache is enabled, only load if we don't have any children.
        const forceLoad = (item.cacheResolvedChildren ? !item.children : true);

        if (item.childrenResolver && forceLoad) {
            item['_isResolving'] = true;
            item.children = await item.childrenResolver(this.data);
            item['_isResolving'] = false;
        }

        if (!item.childTemplate && !item.children) {
            if (item.action) {
                item.action(this.data);
                this.close();
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
            ? calcComponentBounds(TemplateWrapper, { template: item.childTemplate })
            : calcMenuItemBounds(item.children, this.data));

        if (bounds.y + height > window.innerHeight)
            cords.bottom = "0px";
        if (bounds.x + bounds.width + width > window.innerWidth)
            cords.left = ((bounds.x - width)) + "px";

        if (!cords.bottom) cords.top = bounds.y + "px";
        if (!cords.left) cords.left = bounds.x + bounds.width + "px";

        const component = item.children ? MenuComponent : TemplateWrapper as any;

        const dialogRef = this.dialog.open(component, {
            position: cords,
            panelClass: ["ngx-menu", "ngx-app-menu"].concat(this.config?.customClass || []),
            backdropClass: "ngx-menu-backdrop",
            hasBackdrop: false,
            data: {
                data: this.data,
                parentCords: this.viewContainer?.element?.nativeElement?.getBoundingClientRect(),
                items: item.children,
                template: item.childTemplate,
                config: this.config
            }
        });

        let _s = dialogRef
            .afterClosed()
                .subscribe((result) => {
                    if (result != -1) {
                        if (result && typeof item.action == 'function')
                            item.action(result);

                        this.close();
                    }
                    else {
                        item['_selfclose'] = Date.now();
                    }

                    _s.unsubscribe();
                });

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
    close() {
        this.closeSignal.emit();

        this.dialogRef?.close();
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

    // private hoveredItems: MatDialogRef<any>[];
    // async onHover(item, row: HTMLTableRowElement) {
    //     this.hoveredItems.forEach(i => i.close(-1));

    //     if (typeof item['_selfclose'] == 'number' && (Date.now() - item['_selfclose']) < 3*1000) return;

    //     const hi = await this.onMenuItemClick(item, row, true);
    //     this.hoveredItems.push(hi);

    //     hi.afterClosed().toPromise().then(e => {
    //         this.viewContainer.element.nativeElement.focus();
    //         this.hoveredItems.splice(this.hoveredItems.findIndex(i => i == hi), 1);
    //     })
    // }

    // closeOnLeave = false;
    // async onLeave() {
    //     if (this.closeOnLeave) {
    //         if (this.hoveredItems.length > 0) {
    //             this.hoveredItems.forEach(i => i.close(-1));
    //             this.hoveredItems.splice(0);
    //         }
    //         else {
    //             this.closeSignal.next(-1);

    //             this.dialogRef.close(-1);
    //         }
    //     }
    // }
}
