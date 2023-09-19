import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'gtk-icon-button',
    templateUrl: './icon-button.component.html',
    styleUrls: ['./icon-button.component.scss'],
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule
    ],
    standalone: true
})
export class GtkIconButtonComponent {

    @Input() fontIcon: string;

    @Output() click = new EventEmitter();

    @Input() disabled = false;

    showDialog = false;

    onClick() {

        this.click.emit();
    }
}
