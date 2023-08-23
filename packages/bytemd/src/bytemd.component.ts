import { Component, EventEmitter, Input, Output, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Editor, Viewer } from 'bytemd';
import gfm from '@bytemd/plugin-gfm';
import frontmatter from '@bytemd/plugin-frontmatter';
import mermaid from '@bytemd/plugin-mermaid'
import mediumZoom from '@bytemd/plugin-medium-zoom';
import highlight from '@bytemd/plugin-highlight';

@Component({
    selector: 'ngx-bytemd',
    template: ``,
    styleUrls: ['./bytemd.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None
})
export class ByteMDComponent {

    @Input() value: string;
    @Output() valueChange = new EventEmitter<string>();

    @Input() mode: "edit" | "view";

    editor: Editor;

    constructor(private ngContainer: ViewContainerRef) {

    }

    ngAfterViewInit() {
        this.editor = new (this.mode == "view" ? Viewer : Editor)({
            target: this.ngContainer.element.nativeElement, // DOM to render
            props: {
                value: this.value,
                plugins: [
                    gfm(),
                    highlight(),
                    mediumZoom(),
                    mermaid(),
                    frontmatter()
                ],
            }
        });

        this.editor.$on('change', (e) => {
            this.valueChange.next(this.value = e.detail.value);
            this.editor.$set({ value: e.detail.value });
        });
    }

    ngOnDestroy() {
        this.editor.$destroy();
    }
}
