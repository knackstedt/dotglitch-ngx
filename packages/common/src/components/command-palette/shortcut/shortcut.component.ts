import { Component, Input, OnInit } from '@angular/core';
import { KeybindCode } from '../../../services/command-palette.service';

@Component({
    selector: 'app-shortcut',
    templateUrl: './shortcut.component.html',
    styleUrls: ['./shortcut.component.scss'],
    standalone: true
})
export class ShortcutComponent {

    @Input() shortcut: KeybindCode;

    keys: string[] = [];

    ngOnChanges() {
        this.keys = this.shortcut.split("+");
    }
}
