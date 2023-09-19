import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { NgxFileManagerConfiguration } from '../../filemanager.component';

export type Breadcrumb = {
    label: string,
    id: string | number
}

@Component({
    selector: 'gtk-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    imports: [
        NgForOf,
        NgIf
    ],
    standalone: true
})
export class GtkBreadcrumbComponent implements OnInit {

    // Could also do object array?
    @Input() crumbs: Breadcrumb[];
    @Output() crumbClick = new EventEmitter<Breadcrumb>();

    @Input() config: NgxFileManagerConfiguration;

    constructor() { }

    ngOnInit() {
    }
}
