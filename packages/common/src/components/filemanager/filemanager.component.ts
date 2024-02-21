import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { AngularSplitModule } from 'angular-split';

import { FileGridComponent } from './file-grid/file-grid.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { FileSorting, NGX_WEB_COMPONENTS_CONFIG, NgxWebComponentsConfig } from '../types';
import { IconResolver } from './icon-resolver';
import { LazyLoaderService, NGX_LAZY_LOADER_CONFIG } from '../lazy-loader/lazy-loader.service';
import { Fetch } from '../../public-api';
import { ulid } from 'ulidx';

// TODO:
/**
 * Multiple music / video / image files selected turns into a playlist
 * Dragging music / video / image queues the file(s)
 * Can save and edit a list of files as playlist
 * Can "loop" "randomize"
 */

export type DirectoryDescriptor = {
    kind: "directory",
    path: string,
    name: string
    contents: {
        dirs: DirectoryDescriptor[],
        files: FileDescriptor[]
    }
}

export type FileDescriptor = {
    kind: "file",
    stats: {
        size: number;
        // Size for zipped file
        compressedSize?: number,
        atimeMs: number;
        mtimeMs: number;
        ctimeMs: number;
        birthtimeMs: number;
    },
    path: string
    name: string,
    ext: string,
    // Comment for entries in a zip file.
    comment?: string
};

export type FSDescriptor = DirectoryDescriptor | FileDescriptor;

export type FileViewTab = {
    id: string,
    label: string,
    breadcrumb: {
        id: string,
        label: string
    }[],
    path: string,
    selection: FSDescriptor[],
    viewMode: "grid" | "list",
    historyIndex: number,
    history: string[],
    sidebarItems: FSDescriptor[],
    sortOrder: FileSorting
}

// TODO: replace http configs
type HttpConfiguration = (
    { url: string } |
    { urlTemplate: (path: string) => string }
) & {
    method?: "get" | "put" | "post" | "patch" | "delete",
    headers?: { [key: string]: string }
}

export type NgxFileManagerConfiguration = Partial<{
    /**
     * Initial path
     */
    path: string,

    /**
     * Custom root path (will appear as '/').
     * Defaults to '/'.
     *
     * User cannot view outside of this path.
     *   (Not to be used as a security measure!)
     */
    chrootPath: string,

    /**
     * Restrict users to only navigate around to subpaths of the specified `path`
     */
    navigateOnlyToDescendants: boolean,
    showBreadcrumb: boolean,
    showTreeview: boolean,

    /**
     * Name of the "root" path `/`
     * Defaults to "Storage"
     */
    rootName: string,

    /**
     * Maximum number of items to be stored in history.
     */
    maxHistoryLength: number,

    apiSettings: {
        listEntriesUrl?: string,
        listEntriesUrlTemplate?: (path: string) => string,
        downloadEntryUrl?: string,
        downloadEntryUrlTemplate?: (path: string) => string,
        uploadEntryUrl?: string,
        uploadEntryUrlTemplate?: (path: string) => string,
        deleteEntryUrl?: string,
        deleteEntryUrlTemplate?: (path: string) => string,
        renameEntryUrl?: string,
        renameEntryUrlTemplate?: (path: string) => string,
        createDirectoryUrl?: string,
        createDirectoryUrlTemplate?: (path: string) => string
    },

    /**
     * The path that images are loaded from.
     * Default value `/assets/dotglitch/webcomponents/`
     */
    assetPath: string,
    sidebarLocationStrategy: "known" | "currentDirectory",

    iconResolver: (file: FSDescriptor) => string,

    imageSize: "normal" | "small" | "huge",

    /**
     *
     */
    selectionMode: "single" | "multiple",

    /**
     * This determines if the filemanager shows selected entries
     *
     * If set to `focusFiles`, file paths that match from the provided `focusedFiles`
     * will be highlighted, and can be selected / deselected.
     */
    mode: "focusFiles" | "normal",
    focusedFiles: string[]
}>

@Component({
    selector: 'app-filemanager',
    templateUrl: './filemanager.component.html',
    styleUrls: ['./filemanager.component.scss'],
    imports: [
        NgIf,
        NgForOf,
        AngularSplitModule,
        FileGridComponent,
        MatTabsModule,
        MatIconModule,
        MatSidenavModule,
        ToolbarComponent,
        TreeViewComponent
    ],
    standalone: true
})
export class FilemanagerComponent implements OnInit {
    @ViewChild('tabGroup') tabGroup: MatTabGroup;
    @ViewChildren(FileGridComponent) fileGrids: QueryList<FileGridComponent>;
    @ViewChild(TreeViewComponent) treeView: TreeViewComponent;
    @ViewChild(ToolbarComponent) toolbar: ToolbarComponent;
    @ViewChild(MatDrawerContainer) drawer: MatDrawerContainer;

    @Input() config: NgxFileManagerConfiguration = {
        apiSettings: {
            listEntriesUrl: `/api/filesystem/`,
            uploadEntryUrl: `/api/filesystem/`,
            downloadEntryUrl: `/api/filesystem/`,
            deleteEntryUrl: `/api/filesystem/`,
            createDirectoryUrl: `/api/filesystem/folder`,
            renameEntryUrl: `/api/filesystem/rename`
        }
    };

    @Input() gridSize: "small" | "normal" | "large" = "normal";
    @Input() mode: "grid" | "list";
    @Input() contextTags: {[key: string]: string};


    @Input() value: FSDescriptor[] = [];
    @Output() valueChange = new EventEmitter<FSDescriptor[]>();

    gridValues: FSDescriptor[][] = [];

    /**
     * Emits when focused files change.
     * Only available in `focusFiles` mode.
     */
    @Output() focusedFilesChange = new EventEmitter();
    /**
     * Emits when a file is uploaded.
     */
    @Output() fileUpload = new EventEmitter();
    /**
     * Emits when a file is downloaded.
     */
    @Output() fileDownload = new EventEmitter();
    @Output() fileRename = new EventEmitter();
    @Output() fileDelete = new EventEmitter();
    @Output() fileCopy = new EventEmitter();
    @Output() filePaste = new EventEmitter();

    @Output() fileSelect = new EventEmitter<FileDescriptor>();
    @Output() fileDblClick = new EventEmitter<FileDescriptor>();
    @Output() folderSelect = new EventEmitter<DirectoryDescriptor>();
    @Output() folderDblClick = new EventEmitter<DirectoryDescriptor>();

    /**
     * Emits when multiple file selections change.
     */
    @Output() filesSelect = new EventEmitter<FSDescriptor[]>();
    /**
     * Emits when any selection changes, single or multiple files.
     */
    // @Output() selectionChange = new EventEmitter<FSDescriptor[]>();

    showHiddenFiles = false;
    showSidebar = true;
    sidebarOverlay = false;
    width = 0;

    isHomeAncestor = false;

    currentTab: FileViewTab = {} as any;
    get currentFileGrid() { return this.fileGrids.get(this.tabIndex) }
    tabIndex = 0;
    tabs: FileViewTab[] = [];

    iconResolver: IconResolver;

    constructor (
        @Optional() @Inject(NGX_WEB_COMPONENTS_CONFIG) readonly libConfig: NgxWebComponentsConfig = {},
        private readonly lazyLoader: LazyLoaderService,
        private viewContainer: ViewContainerRef,
        private fetch: Fetch
    ) {
        lazyLoader.registerComponent({
            id: "folder-rename",
            group: "@dotglitch/ngx-web-components",
            load: () => import('./folder-rename/folder-rename.component')
        })

        this.iconResolver = new IconResolver(libConfig.assetPath);
    }

    ngOnInit(): void {
        this.initTab(this.config.path);
        this.currentTab = this.tabs[0];
    }

    ngAfterViewInit() {
        this.onResize();

        setTimeout(() => this.onResize(), 250);
    }

    onTreeViewLoadChildren({item, cb}) {
        const url = this.config.apiSettings.listEntriesUrlTemplate
                  ? this.config.apiSettings.listEntriesUrlTemplate(item.path + item.name)
                  : this.config.apiSettings.listEntriesUrl

        this.fetch.post(url, { path: item.path + item.name, showHidden: this.showHiddenFiles })
            .then((data: any) => {
                const dirs: DirectoryDescriptor[] = data.dirs;
                cb(dirs);
            })
    }

    initTab(path: string) {
        this.tabs.push(this.currentTab = {
            id: ulid(),
            label: this.getTabLabel(path),
            breadcrumb: this.calcBreadcrumb(path),
            path,
            selection: [],
            viewMode: this.mode || 'grid',
            historyIndex: 0,
            history: [],
            sidebarItems: [],
            sortOrder: 'a-z'
        });
        this.tabIndex = this.tabs.length;
    }

    closeTab(tab: FileViewTab) {
        this.tabs.splice(this.tabs.findIndex(t => t.id == tab.id), 1);
    }

    calcBreadcrumb(path: string) {
        if (!path) return null;

        path = path.replace("#/", '/');

        // If we're acting like we're in a changed root, we wipe out
        // breadcrumbs below the root
        if (this.config.chrootPath) {
            path = path.replace(this.config.chrootPath, '');
            const parts = path.split('/');

            path = path.replace(/^\//, this.config.chrootPath);
            return parts.map((p, i) => {
                const path = parts.slice(0, i + 1).join('/');

                return {
                    id: (this.config.chrootPath + (path || '/')).replace(/\/+/g, '/'),
                    label: p || ""
                };
            });
        }
        else {
            const parts = path.split('/');

            return parts.map((p, i) => {
                const path = parts.slice(0, i + 1).join('/');

                return {
                    id: path || '/',
                    label: p || ""
                };
            });
        }
    }

    onBreadcrumbClick(crumb) {
        if (crumb.id) {
            this.currentTab.path = crumb.id;
            this.currentTab.breadcrumb = this.calcBreadcrumb(crumb.id);
        }
    }

    onTabPathChange(tab: FileViewTab) {
        tab.label = this.getTabLabel(tab.path);
        tab.breadcrumb = this.calcBreadcrumb(tab.path);

        tab.historyIndex++;
        tab.history.push(tab.path);
        tab.history.splice(typeof this.config.maxHistoryLength == 'number' ? this.config.maxHistoryLength : 50);
    }

    onTreeViewSelect(item: FSDescriptor) {
        this.currentTab.path = item.path + item.name;
    }

    onTabLoadFiles(tab: FileViewTab, files: FSDescriptor[]) {
        if (tab.sidebarItems.length == 0) {
            tab.sidebarItems = files.filter(f => f.kind == "directory");
            return;
        }

        const currentItems = tab.sidebarItems;
        const dirItems = files.filter(f => f.kind == "directory");

        function recurse(items) {
            return items.find(i => tab.path?.startsWith(i.path));
        }
        const target = recurse(currentItems);

        if (target)
            target['_children'] = dirItems;

        tab.sidebarItems = currentItems;
    }

    onGridValueChange() {
        this.value = this.gridValues.flat(1);
        this.valueChange.emit(this.value)
    }

    getTabLabel(path: string) {
        return path?.split('/').filter(p => p).pop();
    }

    async onResize() {
        // Trigger re-calculation of the view
        this.fileGrids.forEach(g => g.resize());

        const el = this.viewContainer.element.nativeElement as HTMLElement;
        const bounds = el.getBoundingClientRect();
        this.width = bounds.width;

        // If the view area is less than 650px wide, use overlay the sidebar panel
        this.sidebarOverlay = bounds.width < 650;
        if (this.sidebarOverlay == false && [...this.drawer._drawers][0].opened) {
            this.drawer.close();
        }
    }

    async onResizeEnd() {
        this.onResize();

        setTimeout(() => this.onResize(), 250);
    }

    getSelection() {
        if (this.currentTab.viewMode == "grid") {
            return this.currentTab.selection
        }
        else {
            return this.value;
        }
    }

    clearSelection() {
        this.fileGrids.forEach(g => g.clearSelection());
    }

    // Tell the child grid to refresh it's sorting
    refreshSorting() {
        this.fileGrids.forEach(g => g.sort());
    }

    refreshData() {
        this.fileGrids.forEach(g => g.loadFolder());
    }

    getFileData(file: FileDescriptor) {
        let url = this.config.apiSettings.renameEntryUrlTemplate
            ? this.config.apiSettings.renameEntryUrlTemplate(file.path + file.name)
            : this.config.apiSettings.renameEntryUrl;

        url = (url.includes('?') ? '&' : '?') + `dir=${file.path}&file=${file.name}`;

        return url;
    }

    downloadFile(file: FSDescriptor) {
        let path = file.path + file.name;
        if (file.kind == "directory" && !path.endsWith('/'))
            path += "/";

        const url = this.config.apiSettings.downloadEntryUrlTemplate
            ? this.config.apiSettings.downloadEntryUrlTemplate(path)
            : this.config.apiSettings.downloadEntryUrl;

        // window.open(target);
        var link = document.createElement("a");
        link.download = file.name;
        link.href = url;
        link.click();
        link.remove();
        this.fileDownload.next(file);
    }
}
