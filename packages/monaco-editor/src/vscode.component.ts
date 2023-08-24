import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';

import * as MonacoEditor from 'monaco-editor';
import { MonacoAutoTypeImporter } from './ts-type-resolver/main';
import { debounceTime } from 'rxjs';

let Monaco: typeof MonacoEditor;

@Component({
    selector: 'ngx-vscode',
    template: '',
    styles: [`
:host {
    display: block;
    height: 100%;
    max-height: 100vh;
    max-width: 100vw;
}
    `],
    standalone: true
})
export class VscodeComponent implements AfterViewInit, OnDestroy {
    isDirty = false;
    editor: MonacoEditor.editor.IStandaloneCodeEditor;
    filename: string;

    private _code: string;
    @Input() set code(value: string) {
        if (value == this._code)
            return;
        if (typeof value != "string")
            throw new TypeError("Value must be of type string");

        this._code = value;
        this.editor?.setValue(this.code);
    };
    get code() { return this._code?.trim() }
    @Output() codeChange = new EventEmitter<string>();
    private onCodeType = new EventEmitter<string>();
    private typeDebounce = this.onCodeType.pipe(debounceTime(100));

    @Input() customLanguage: { init: Function; };


    private _language: string;
    @Input() set language(value: string) {
        this._language = {
            'ts': "typescript",
            'html': 'xml',
            'scss': 'css'
        }[value] || value || "auto"
    }
    get language() { return this._language }

    @Input() installationLocation = "/lib/monaco/vs";


    @Input() tabSize = 2;
    @Input() readOnly = false;
    @Input() theme = "vs-dark";
    @Input() fontFamily = "Droid Sans Mono";
    @Input() fontSize = 14;

    @Input() automaticLayout = true;
    @Input() colorDecorators = true;
    @Input() folding = true;

    @Input() minimapEnabled = true;
    @Input() minimap: MonacoEditor.editor.IEditorMinimapOptions = {
        enabled: true
    };
    @Input() scrollbar: MonacoEditor.editor.IEditorScrollbarOptions = {
        alwaysConsumeMouseWheel: false,
        // scrollByPage: true
    };
    @Input() smoothScrolling = true;
    @Input() mouseWheelScrollSensitivity = 2;
    @Input() scrollBeyondLastLine = false;
    @Input() scrollBeyondLastColumn = 0;
    @Input() scrollbarAlwaysConsumeMouseWheel = 2;

    @Input() lineNumbers: MonacoEditor.editor.LineNumbersType = "on";

    get settings() {
        return {
            theme: this.theme,
            language: this.language,
            tabSize: this.tabSize,
            readOnly: this.readOnly,
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            automaticLayout: this.automaticLayout,
            scrollBeyondLastLine: this.scrollBeyondLastLine,
            colorDecorators: this.colorDecorators,
            folding: this.folding,
            scrollBeyondLastColumn: this.scrollBeyondLastColumn,
            minimap: this.minimap,
            scrollbar: this.scrollbar,
            smoothScrolling: this.smoothScrolling,
            mouseWheelScrollSensitivity: this.mouseWheelScrollSensitivity,
            lineNumbers: this.lineNumbers
        } as MonacoEditor.editor.IStandaloneEditorConstructionOptions;
    }

    verticalScrollExhausted = false;

    private _sub;
    constructor(private viewContainer: ViewContainerRef) {
        this.installMonaco();

        this._sub = this.typeDebounce.subscribe(t => {
            this.codeChange.next(this._code = this.editor.getValue());
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // If we changed anything OTHER than code, reload the editor
        if (Object.keys(changes).length > 1 || !changes['code']) {
            if (this.editor) {
                this.editor?.dispose();
                this.createEditor();
            }
        }
        if (changes['theme'])
            Monaco?.editor.setTheme(this.theme);
    }

    async ngAfterViewInit() {

        await new Promise((res, rej) => {
            let count = 0;
            let i = window.setInterval(() => {
                count++;

                if (window['monaco'] != undefined) {
                    window.clearInterval(i);

                    Monaco = window['monaco'];
                    res(true);
                }
                if (count >= 100) {
                    window.clearInterval(i);
                    res(false);
                }
            }, 100);
        });

        this.createEditor();
    }

    ngOnDestroy(): void {
        this.editor?.dispose();
        this._sub?.unsubscribe();
    }

    private createEditor() {
        if (this.customLanguage) {
            this.customLanguage.init(Monaco);
        }


        let editor = this.editor = Monaco.editor.create(this.viewContainer?.element?.nativeElement, this.settings as any);



        // const autoTypings = await
        MonacoAutoTypeImporter.create(editor, {
            monaco: Monaco,
        });

        this.configureLanguageSupport();

        if (this.code) {
            editor.setValue(this.code);
        }

        editor.getModel().onDidChangeContent(() => this.onCodeType.emit());
    }

    private configureLanguageSupport() {

    }

    /**
     * true if the monaco UMD files are injected into the webpage
     */
    private static isMonacoInstalled = false;
    private installMonaco() {
        if (VscodeComponent.isMonacoInstalled) return;

        // Monaco has a UMD loader that requires this
        // Merge with any pre-existing global require objects.
        if (!window['require']) window['require'] = {} as any;
        if (!window['require']['paths']) window['require']['paths'] = {};

        if (this.installationLocation.endsWith('/'))
            this.installationLocation = this.installationLocation.slice(0, -1);

        window['require']['paths'].vs = this.installationLocation;

        const monacoFiles = [
            'loader.js',
            'editor/editor.main.nls.js',
            'editor/editor.main.js',
        ];

        for (let i = 0; i < monacoFiles.length; i++) {
            const script = document.createElement("script");
            script.setAttribute("defer", "");
            script.setAttribute("src", this.installationLocation + '/' + monacoFiles[i]);
            document.body.append(script);
        }
        VscodeComponent.isMonacoInstalled = true;
    }

    download() {
        const code = this.editor.getValue();

        let blob = new Blob([code], { type: 'text/log' });
        let elm = document.createElement('a');
        let blobURL = URL.createObjectURL(blob);

        // Set the data values.
        elm.href = blobURL;
        elm.download = this.filename;

        document.body.appendChild(elm);
        elm.click();

        document.body.removeChild(elm);
        elm.remove();

        URL.revokeObjectURL(blobURL);
    }

    @HostListener('window:resize', ['$event'])
    resize = (): void => {
        this.editor?.layout();
    };
}
