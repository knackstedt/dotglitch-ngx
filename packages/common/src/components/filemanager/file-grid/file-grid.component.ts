import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef, Optional, Inject, TemplateRef, ChangeDetectorRef, SecurityContext } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CellComponent, EmptyCallback } from 'tabulator-tables';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DirectoryDescriptor, FileDescriptor, FilemanagerComponent, FileViewTab, FSDescriptor, NgxFileManagerConfiguration } from '../filemanager.component';
import { FileSorting } from '../../types';
import { IconResolver } from '../icon-resolver';
import { TabulatorComponent } from '../../tabulator/tabulator.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { uploadFile } from '../helpers';
import { DialogService, Fetch, KeyboardService, MenuDirective, MenuItem, openMenu } from '../../../public-api';
import { DomSanitizer } from '@angular/platform-browser';

const itemWidth = (80 + 20);

@Component({
    selector: 'app-file-grid',
    templateUrl: './file-grid.component.html',
    styleUrls: ['./file-grid.component.scss'],
    imports: [
        NgIf,
        NgForOf,
        DatePipe,
        MatTabsModule,
        NgScrollbarModule,
        MatInputModule,
        MatCheckboxModule,
        MatProgressBarModule,
        TabulatorComponent,
        MenuDirective,
        ScrollingModule
    ],
    standalone: true
})
export class FileGridComponent implements OnInit {
    @ViewChild("fileViewport") filesRef: ElementRef;
    @ViewChild(TabulatorComponent) tabulator: TabulatorComponent;

    @ViewChild('renameTemplate', { read: TemplateRef }) renameTemplate: TemplateRef<any>;


    private _path: string;
    @Input() set path(value: string) {
        if (!value) return;

        if (this._path && this.config.navigateOnlyToDescendants) {
            if (!value.startsWith('/'))
                value = '/' + value;
            if (!value.startsWith(this.config.path))
                return;
        }

        let prev = this._path;

        this._path = value;

        if (prev != value) {
            this.pathChange.next(this.path);
            if (this.config.apiSettings)
                this.loadFolder()
        }
    }
    get path() {return this._path}
    @Output() pathChange = new EventEmitter<string>();

    @Input() config: NgxFileManagerConfiguration = {};
    @Input() showHiddenFiles = false;
    @Input() viewMode: "list" | "grid" = "grid";
    @Input() gridSize: "small" | "normal" | "large" = "normal";
    @Input() tab: FileViewTab;

    @Output() fileSelect = new EventEmitter<FileDescriptor>();
    @Output() fileDblClick = new EventEmitter<FileDescriptor>();
    @Output() folderSelect = new EventEmitter<DirectoryDescriptor>();
    @Output() folderDblClick = new EventEmitter<DirectoryDescriptor>();
    @Output() newTab = new EventEmitter<{ path: string; }>();
    @Output() loadFiles = new EventEmitter<FSDescriptor[]>();

    directoryContents: FSDescriptor[] = [];
    @Input() selection: FSDescriptor[] = [];
    @Output() selectionChange = new EventEmitter<FSDescriptor[]>();

    @Input() value: FSDescriptor[] = [];
    @Output() valueChange = new EventEmitter<FSDescriptor[]>();

    selectionText: string;

    sortedFolders: any[][] = [];

    private readonly sorters = {
        "a-z": (a: FileDescriptor, b: FileDescriptor) => a.name > b.name ? 1 : -1,
        "z-a": (a: FileDescriptor, b: FileDescriptor) => b.name > a.name ? 1 : -1,
        "lastmod": (a: FileDescriptor, b: FileDescriptor) => b.stats.mtimeMs - a.stats.mtimeMs,
        "firstmod": (a: FileDescriptor, b: FileDescriptor) => a.stats.mtimeMs - b.stats.mtimeMs,
        "size": (a: FileDescriptor, b: FileDescriptor) => b.stats.size - a.stats.size,
        "type": (a: FileDescriptor, b: FileDescriptor) => a.path.split('.').splice(-1, 1)[0] > b.path.split('.').splice(-1, 1)[0] ? 1 : -1
    };
    @Input() sortOrder: FileSorting = "a-z";

    itemsPerRow = 6;

    // If the current directory is inside of an archive
    isArchive = true;

    userIsDraggingFile = false;
    draggingOver = false;

    showLoader = false;
    hideLoader = false;

    readonly columns = [
        { id: "name", label: "Name" },
        { id: "size", label: "Size"},
        { id: "type", label: "Type"},
        { id: "owner", label: "Owner"},
        { id: "group", label: "Group"},
        { id: "permissions", label: "Permissions"},
        { id: "location", label: "Location"},
        { id: "modified", label: "Modified"},
        { id: "modified--time", label: "Modified - Time"},
        { id: "accessed", label: "Accessed"},
        { id: "created", label: "Created"},
        { id: "recency", label: "Recency"},
        { id: "star", label: "Star"},
        { id: "detailed-type", label: "Detailed Type"},
    ];

    cols = [
        { id: "name", label: "Name" },
        { id: "size", label: "Size" },
        { id: "modified", label: "Modified" },
        { id: "star", label: "Star" }
    ];

    folderContextMenu: MenuItem<FSDescriptor>[] = [
        {
            label: "New Folder",
            // shortcutLabel: "Shift+Ctrl+N",
            icon: "create_new_folder",
            action: (data) => {
                // console.log("New folder goodness");
                // console.log(data);
                this.dialog.open("folder-rename", "@dotglitch/ngx-web-components", {
                    inputs: { path: data?.path || this.path, name: data?.name || '', config: this.config }
                }).then(r => this.loadFolder())
            }
        },
        {
            label: "Upload file",
            // shortcutLabel: "Ctrl+D",
            icon: "file_upload",
            action: (evt) => uploadFile(this.fetch, this.config, this._path, evt ? (evt.path + evt.name) : null, this.fileManager.contextTags).then(res => {
                this.loadFolder();
            })
        },
        "separator",
        // {
        //     isDisabled: (data) => true,
        //     label: "_P_aste",
        //     icon: "content_paste",
        //     action: (evt) => {
        //     }
        // },
        {
            label: "Select _A_ll",
            shortcutLabel: "Ctrl+A",
            icon: "select_all",
            action: (evt) => {
                this.selection = this._sortFilter();
                this.selectionText = this.getSelectionText();
                this.selectionChange.next(this.selection);
            }
        },
        // "separator",
        // {
        //     label: "P_r_operties",
        //     icon: "find_in_page",
        //     action: (evt) => {

        //     }
        // }
    ];

    fileContextMenu: MenuItem<FSDescriptor>[] = [];

    performChecksum(path, digest) {
        // this.windowManager.openWindow({
        //     appId: "checksum",
        //     data: { digest, path },
        //     workspace: this.windowRef.workspace,
        //     width: 600,
        //     height: 250
        // });
    }

    iconResolver: IconResolver;

    get libConfig() { return this.fileManager.libConfig }
    constructor(
        private readonly fetch: Fetch,
        private readonly keyboard: KeyboardService,
        private readonly dialog: DialogService,
        private readonly matDialog: MatDialog,
        private readonly fileManager: FilemanagerComponent,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly sanitizer: DomSanitizer
    ) {


        this.iconResolver = new IconResolver(this.libConfig.assetPath);

        // ctrl + a => select all
        keyboard.onKeyCommand({
            key: "a",
            ctrl: true,
        }).subscribe(evt => {
            this.selection = this._sortFilter();
            this.selectionText = this.getSelectionText();
            this.selectionChange.next(this.selection);
        });

        // ctrl + c => copy file names to clipboard
        keyboard.onKeyCommand({
            key: "c",
            ctrl: true,
        }).subscribe(evt => {

        });

        // ctrl + h => toggle hidden files
        keyboard.onKeyCommand({
            key: "h",
            ctrl: true,
            interrupt: true
        }).subscribe(evt => {
            this.showHiddenFiles = !this.showHiddenFiles;
        });

        // F2 => Rename selected files
        keyboard.onKeyCommand({
            key: "f2",
        }).subscribe(evt => {
            // Rename selected file(s)
        });

        // Enter => Open selected files
        keyboard.onKeyCommand({
            key: "Enter",
        }).subscribe(evt => {
            const files = this.directoryContents.filter(dc => this.selection.find(i => i.name == dc.name));
            // this.windowManager.openFiles(files as any);
        });

        // Delete => delete selected files
        keyboard.onKeyCommand({
            key: "delete",
        }).subscribe(evt => {
            const files = this.directoryContents.filter(dc => this.selection.find(i => i.name == dc.name));
        });
    }

    async ngOnInit() {
        // this.loadFolder();
    }

    ngAfterViewInit() {
        this.fileContextMenu = [
            {
                label: "Download",
                icon: "download",
                action: (file) => {
                    let target = `${window.origin}${this.config.apiSettings.downloadEntryUrl}`;
                    let path = file.path + file.name;

                    if (file.kind == "directory" && !path.endsWith('/'))
                        path += "/";

                    target += `${target.includes('?') ? '&' : '?'}path=${path}&ngsw-bypass=true`;
                    console.log(target);
                    // window.open(target);
                    var link = document.createElement("a");
                    link.download = file.name;
                    link.href = target;
                    link.click();
                    link.remove();
                    this.fileManager.fileDownload.next(file);
                }
            },
            {
                label: "Open in new Tab",
                icon: "open_in_new",
                isVisible: (data) => data.kind == "directory",
                action: (data) => {
                    this.fileManager.initTab(data.path + data.name);
                }
            },
            // {
            //     label: "Open with Application...",
            //     isVisible: (data) => data.kind == "file",
            //     shortcutLabel: "Ctrl+D",
            //     action: (evt) => {

            //     },
            // },
            "separator",
            // {
            //     label: "Cut",
            //     icon: "content_cut",
            //     isDisabled: data => true,
            //     action: (evt) => {
            //     },
            // },
            // {
            //     label: "Copy",
            //     icon: "file_copy",
            //     isDisabled: data => true,
            //     childrenResolver: () => new Promise(r => setTimeout(r, 500000))
            // },
            // {
            //     label: "Move To...",
            //     icon: "drive_file_move",
            //     shortcutLabel: "Ctrl+A",
            //     action: (evt) => {

            //     },
            // },
            // {
            //     label: "Copy To...",
            //     icon: "folder_copy",
            //     shortcutLabel: "Ctrl+A",
            //     action: (evt) => {

            //     },
            // },
            {
                label: "Delete",
                icon: "delete",
                // shortcutLabel: "Del",
                isVisible: data => !data.path.includes("#/"), // omit files in compressed dirs
                action: (evt) => {
                    const path = evt.path + evt.name;

                    const url = this.config.apiSettings.deleteEntryUrlTemplate
                        ? this.config.apiSettings.deleteEntryUrlTemplate(path)
                        : this.config.apiSettings.deleteEntryUrl;

                    this.fetch.post(url, { path: evt.path + evt.name })
                        .then(() => this.loadFolder())
                },
            },
            // {
            //     label: "Shred file",
            //     icon: "delete_forever",
            //     isVisible: data => !data.path.includes("#/"), // omit files in compressed dirs
            //     action: (evt) => {
            //         this.fetch.post(`/api/filesystem/delete?wipe=true`, { files: [evt.path + evt.name]})
            //             .then(() => this.loadFolder())
            //     },
            // },
            {
                label: "Rename",
                icon: "drive_file_rename_outline",
                isVisible: data => !data.path.includes("#/"), // omit files in compressed dirs
                // shortcutLabel: "F2",
                action: (data) => {
                    this.dialog.open("folder-rename", "@dotglitch/ngx-web-components", {
                        inputs: { path: data?.path || this.path, name: data?.name || '', config: this.config }
                    }).then(r => this.loadFolder())
                }
            },

            // Extract Here
            // Extract To...
            // {
            //     label: "Extract Here",
            //     icon: "folder_zip",
            //     shortcutLabel: "Ctrl+A",
            //     isDisabled: (data) => !(data.kind == "file" && data.ext != ".zip" && isArchive(data)),
            //     action: (evt) => {
            //         // TODO
            //     },
            // },
            // {
            //     label: "Extract to...",
            //     icon: "folder_zip",
            //     shortcutLabel: "Ctrl+A",
            //     isDisabled: (data) => !(data.kind == "file" && data.ext != ".zip" && isArchive(data)),
            //     action: (evt) => {
            //         // TODO
            //     },
            // },
            // {
            //     label: "Compress...",
            //     icon: "folder_zip",
            //     shortcutLabel: "Ctrl+A",
            //     isDisabled: (data) => data.kind == "file",
            //     action: (evt) => {
            //         // TODO
            //     },
            // },
            {
                label: "Checksum",
                icon: "manage_search",
                isDisabled: (data) => data.kind != "file",
                children: [
                    {
                        label: "MD5",
                        action: (evt) => this.performChecksum(evt.path + evt.name, "md5"),
                    },
                    {
                        label: "SHA1",
                        action: (evt) => this.performChecksum(evt.path + evt.name, "sha1"),
                    },
                    {
                        label: "SHA256",
                        action: (evt) => this.performChecksum(evt.path + evt.name, "sha256"),
                    },
                    {
                        label: "SHA512",
                        action: (evt) => this.performChecksum(evt.path + evt.name, "sha512"),
                    },
                ],
                isVisible: (data) => {
                    return false;
                    return !this.isArchive || data.kind == "file";
                },
            },
            // {
            //     label: "Star",
            //     icon: "star",
            //     shortcutLabel: "Ctrl+A",
            //     action: (evt) => {

            //     },
            // },
            // "separator",
            // {
            //     label: "P_r_operties",
            //     icon: "find_in_page",
            //     action: (evt) => {

            //     },
            // }
        ];
    }

    async loadFolder() {
        this.showLoader = true;
        this.hideLoader = false;

        const url = this.config.apiSettings.listEntriesUrlTemplate
            ? this.config.apiSettings.listEntriesUrlTemplate(this.path)
            : this.config.apiSettings.listEntriesUrl

        this.fetch.post(url, { path: this.path, showHidden: this.showHiddenFiles })
            .then((data: any) => {
                const files: FileDescriptor[] = data?.files || [];
                const dirs: DirectoryDescriptor[] = data?.dirs || [];
                const descriptors = files.concat(dirs as any) as FSDescriptor[];

                descriptors.forEach(f => {
                    f['_icon'] = this.iconResolver.resolveIcon(f);
                    if (f.kind == "file") {
                        f['_ctime'] = new Date(f.stats?.ctimeMs)?.toLocaleString();
                        f['_mtime'] = new Date(f.stats?.mtimeMs)?.toLocaleString();
                        f['_size'] = this.bytesToString(f.stats?.size);
                    }
                });

                this.directoryContents = descriptors;

                this._sortFilter();
                this.resize();
                this.loadFiles.next(descriptors);

                if (this.sortedFolders.length > 0)
                    this.flowRows();

                setTimeout(() => this.resize(), 250);
                setTimeout(() => this.resize(), 500);
                setTimeout(() => this.resize(), 1000);
                setTimeout(() => this.resize(), 2500);
                setTimeout(() => this.resize(), 5000);
            })
            .catch(e => console.error(e))
            .finally(() => {
                this.hideLoader = true;
                setTimeout(() => {
                    this.showLoader = false;
                }, 200);
            })
    }

    flowRows() {
        let filtered = this._sortFilter();

        this.sortedFolders = [];
        const num = Math.ceil(filtered.length / this.itemsPerRow);
        const iterations = Math.min(num, 100);

        for (let row = 0; row < iterations; row++) {
            if (!this.sortedFolders[row])
                this.sortedFolders[row] = [];

            for (let i = row * this.itemsPerRow; i < (row + 1) * this.itemsPerRow && i < filtered.length; i++) {
                this.sortedFolders[row].push(filtered[i]);
            }
        }
    }

    onSelect(item: FSDescriptor, evt) {
        evt.stopPropagation();

        if (this.keyboard.isShiftPressed) {
            let start = this.directoryContents.findIndex(i => i.name == this.selection.slice(-1, 1)[0].name);
            let end = this.directoryContents.indexOf(item);

            if (start == -1)
                start = end;

            let items = start > end
                ? this.directoryContents.slice(end, start + 1)
                : this.directoryContents.slice(start, end + 1);

            this.selection = items;
        }
        else if (this.keyboard.isCtrlPressed) {
            if (!this.selection.includes(item))
                this.selection.push(item);
            else // Case that we selected the same item twice
                this.selection.splice(this.selection.indexOf(item), 1);
        }
        else
            this.selection = [item];

        if (this.selection.length == 1) {
            if (this.selection[0].kind == "directory")
                this.folderSelect.next(this.selection[0]);
            else
                this.fileSelect.next(this.selection[0]);
        }

        this.selectionChange.next(this.selection);
        this.selectionText = this.getSelectionText();
    }

    onItemClick(file: FSDescriptor) {
        console.log(file, this);
        if (file.kind == "directory") {
            this.folderDblClick.next(file);
            this.path = file.path + file.name;
        }
        // else if (file.ext == "zip") {
        //     this.fileDblClick.next(file);
        //     this.path = file.path + file.name;
        // }
        else {
            this.fileDblClick.next(file);
            this.fileSelect.next(file);
        }
    }

    onToggle(item, state: MatCheckboxChange) {
        item['_value'] = state.checked;

        // TODO: What causes this to be null when initialized with an array?
        if (!this.value) {
            this.value = [];
        }

        if (state.checked) {
            this.value.push(item);
        }
        else {
            const i = this.value.findIndex(v => v == item);
            if (i >= 0)
                this.value.splice(i, 1);
        }
        this.valueChange.next(this.value);
    }

    async clearSelection() {
        this.value = [];
        this.valueChange.next(this.value);

        this.tabulator?.table?.getRows().forEach(r => r.getElement().classList.remove('selected'));
    }

    private _sortFilter(): FileDescriptor[] {
        return this.directoryContents = this.directoryContents?.filter(d => d.kind == 'directory')
            .concat(this.directoryContents?.filter(d => d.kind == 'file')
                .sort(this.sorters[this.sortOrder])
            ) as FileDescriptor[];
    }

    private getSelectionText() {
        const dirCount = this.selection.filter(s => s.kind == "directory").length;
        const fileCount = this.selection.filter(s => s.kind == "file").length;

        if (dirCount + fileCount == 0) return "";

        const totalSize =
            this.directoryContents
                .filter(d => d.kind == "file")
                .filter(d => this.selection?.find(i => i.name == d.name))
                .map(d => d['stats'].size).reduce((a, b) => a + b, 0);

        if (dirCount + fileCount == 1)
            return `"${this.selection[0].name}" selected (${this.bytesToString(totalSize)})`;

        if (dirCount > 0 && fileCount == 0)
            return `"${dirCount}" folders selected`;
        if (fileCount > 0 && dirCount == 0)
            return `${fileCount} items selected (${this.bytesToString(totalSize)})`;

        return `${dirCount} folder${dirCount == 1 ? "" : "s"} selected, ${fileCount} other item${fileCount == 1 ? "" : "s"} selected (${this.bytesToString(totalSize)})`;
    }

    bytesToString(bytes: number, decimals = 2) {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    public resize() {
        if (!this.filesRef) {
            setTimeout(() => this.resize(), 25);
            return;
        };

        const bounds = (this.filesRef.nativeElement as HTMLElement).getBoundingClientRect();

        const newColCount = Math.floor(bounds.width / itemWidth);
        if (newColCount != this.itemsPerRow) {
            this.itemsPerRow = Math.floor(bounds.width / itemWidth);
            if (this.itemsPerRow > 100)
                this.itemsPerRow = 1;

            this.flowRows();
        }

        if (this.sortedFolders?.length == 0)
            this.flowRows();
    }

    onDragStart(evt: DragEvent, item: FSDescriptor) {
        const target = `${window.origin}/api/filesystem/download?dir=${item.path}&file=${item.name}`;

        evt.dataTransfer.clearData();
        // evt.dataTransfer.setData('text/uri-list', target);
        // evt.dataTransfer.setData('DownloadURL', `text/uri-list:${target}`);
        evt.dataTransfer.setData('text/plain', item.name);
    }

    onDrop(ev) {
        ev.preventDefault();

        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                const file = item.getAsFile();
                console.log(`… file[${i}].name = ${file.name}`);
            }
            });
        } else {
            // Use DataTransfer interface to access the file(s)
            [...ev.dataTransfer.files].forEach((file, i) => {
            console.log(`… file[${i}].name = ${file.name}`);
            });
        }
    }

    nameCellFormatter = ((cell: CellComponent, formatterParams: {}, onRendered: EmptyCallback) => {
        // TODO: Sanitize?
        const item = cell.getData() as FSDescriptor;
        return `
            <span style="display: flex; align-items: center">
                <img style="height: 24px; margin-right: 6px" src="${item['_icon'].path}"/>
                <p style="margin: 0">${this.sanitizer.sanitize(SecurityContext.HTML, item['vanityName'] || item.name)}</p>
            </span>
        `;
    }).bind(this)

    onRowCtx({event, row}) {
        openMenu(this.matDialog, this.fileContextMenu, row.getData(), event);
    }

    onRowClick({event, row, data}) {
        // $event.data['_value'] = $event.data['_value'] == true ? false : true
        // console.log(event, row, data, this.value);

        const rowEl = row.getElement();
        let state = rowEl.classList.contains('selected');
        data['_value'] = !state;

        if (!this.value) {
            this.value = [];
        }

        if (!state) {
            rowEl.classList.add('selected');
            this.value.push(data);
        }
        else {
            rowEl.classList.remove('selected');
            const i = this.value.findIndex(v => v == data);
            if (i >= 0)
                this.value.splice(i, 1);
        }

        this.valueChange.next(this.value);
    }

    sort() {
        this._sortFilter();
    }
}





