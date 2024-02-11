import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnInit, ViewChild, isDevMode } from '@angular/core';
import { CommandAction, CommandPaletteService } from '../../services/command-palette.service';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgScrollbar, NgScrollbarModule } from 'ngx-scrollbar';
import { ShortcutComponent } from './shortcut/shortcut.component';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@Component({
    selector: 'ngx-command-palette',
    templateUrl: './command-palette.component.html',
    styleUrls: ['./command-palette.component.scss'],
    host: {
        "(click)": "textInput.nativeElement.focus()"
    },
    imports: [
        MatIconModule,
        MatInputModule,
        ScrollingModule,
        NgScrollbarModule,
        ShortcutComponent,
        BreadcrumbComponent
    ],
    standalone: true
})
export class CommandPaletteComponent implements OnInit {

    @ViewChild(NgScrollbar) scrollbar: NgScrollbar;
    @ViewChild('textinput') textInput: ElementRef<HTMLInputElement>;

    @Input() contextElement: HTMLElement;

    get el() { return this.elementRef.nativeElement as HTMLElement; }

    readonly MAT_ICON_REGEX = /[:\/\.]/;

    queryString = "";
    activeIndex = 0;
    readonly rowHeight = 29;
    readonly padding = 6;

    commands: CommandAction[] = [];
    filteredCommands: CommandAction[] = [];

    breadcrumbs: {
        action: CommandAction,
        commands: CommandAction[],
        destroying: boolean,
        selectedIndex: number
    }[] = [];

    constructor(
        private readonly commandPalette: CommandPaletteService,
        private readonly dialog: MatDialogRef<any>,
        private readonly elementRef: ElementRef,
        private readonly changeDetector: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) data: any
    ) {
        this.contextElement = this.contextElement ?? data.contextElement;
    }

    ngOnInit() {
        this.commands = this.commandPalette.getRegisteredCommands(this.contextElement)
        this.setCommandList(this.commands);

        // TODO: custom name
        this.breadcrumbs.push({
            action: { label: "/" },
            commands: this.commands,
            destroying: false,
            selectedIndex: 0
        });
    }

    onKeyDown(evt: KeyboardEvent) {
        switch(evt.key) {
            case "Enter": {
                // Fire the first command
                if (this.filteredCommands.length > 0)
                    this.executeCommand(this.filteredCommands[this.activeIndex]);

                evt.stopPropagation();
                return;
            }
            case "ArrowUp": {
                this.activeIndex = Math.max(this.activeIndex-1, 0);

                evt.stopPropagation();
                this.focusRow();
                return;
            }
            case "ArrowDown": {
                this.activeIndex = Math.min(this.filteredCommands.length-1, this.activeIndex+1);

                evt.stopPropagation();
                this.focusRow();
                return;
            }
            case "PageUp": {
                // Fire the first command
                this.activeIndex = Math.max(this.activeIndex-12, 0);

                evt.stopPropagation();
                this.focusRow();
                return;
            }
            case "PageDown": {
                this.activeIndex = Math.min(this.filteredCommands.length-1, this.activeIndex+12);

                evt.stopPropagation();
                this.focusRow();
                return;
            }
            case "Escape": {
                this.dialog.close();
                evt.stopPropagation();
                return;
            }
            case "Backspace": {
                // If we have no characters and we're hitting backspace, go back
                // to the previous menu in the breadcrumb
                if (this.queryString.length == 0 && this.breadcrumbs.length > 1) {
                    const layer = this.breadcrumbs.at(-1);
                    layer.destroying = true;
                    setTimeout(() => {
                        this.setCommandList(this.breadcrumbs.at(-2).commands);
                        this.breadcrumbs.pop();
                        this.activeIndex = layer.selectedIndex;
                    }, 190)
                    return;
                }
                else {
                    break;
                }
            }
            case "Delete": {

            }
        }

        this.activeIndex = 0;
        this.commands.forEach(c => c['_renderedLabel'] = '');

        // Check in the next tick to get the input's
        // value so that it's updated
        setTimeout(() => {
            this.queryString = (evt.target as HTMLInputElement).value;
            this.filterResults();
        })
    }

    private async filterResults() {
        // Whitespace doesn't count.
        if (this.queryString.trim().length == 0) {
            this.filteredCommands = this.commands;
            return;
        }

        const queryChars = this.queryString
            .toLowerCase()
            .split('');

        const matchedCommands: CommandAction[] = [];

        for (const command of this.commands) {
            const { label } = command;

            // Check the label
            if (command.label) {
                const commandChars = label
                    .toLowerCase()
                    .split('');

                let renderedLabel = '';
                let lastIndex = 0;
                let isMatch = true;

                for (const char of queryChars) {
                    const index = commandChars.indexOf(char, lastIndex);

                    if (index == -1) {
                        isMatch = false;
                        break;
                    }
                    else {
                        renderedLabel += label.slice(lastIndex, index) + `<b>${label.slice(index, index + 1)}</b>`;
                        lastIndex = index + 1;
                    }
                }

                renderedLabel += label.slice(lastIndex);

                if (isMatch) {
                    command['_renderedLabel'] = renderedLabel;
                    matchedCommands.push(command);
                }
            }

            // Check the hint
            if (command.hint) {
                const commandChars = label
                    .toLowerCase()
                    .split('');

                let renderedHint = '';
                let lastIndex = 0;
                let isMatch = true;

                for (const char of queryChars) {
                    const index = commandChars.indexOf(char, lastIndex);

                    if (index == -1) {
                        isMatch = false;
                        break;
                    }
                    else {
                        renderedHint += label.slice(lastIndex, index) + `<b>${label.slice(index, index + 1)}</b>`;
                        lastIndex = index + 1;
                    }
                }

                renderedHint += label.slice(lastIndex);

                if (isMatch) {
                    command['_renderedHint'] = renderedHint;
                    matchedCommands.push(command);
                }
            }
        }

        this.filteredCommands = matchedCommands;
    }

    public setCommandList(commands: CommandAction[]) {
        this.commands = commands
            .filter(c => c.visibleInList != false);
        this.filteredCommands = this.commands;
        this.queryString = '';
        this.activeIndex = 0;

        // Reset the filter labels
        this.commands.forEach(command => command['_renderedLabel'] = '');
    }

    private focusRow() {
        const top = this.activeIndex * this.rowHeight;
        const height = this.rowHeight;

        const viewTop = this.scrollbar?.viewport?.scrollTop;
        const viewHeight = this.scrollbar?.viewport?.clientHeight;
        const viewBottom = viewTop + viewHeight;

        if (top < viewTop) {
            this.scrollbar.viewport.nativeElement.scrollTo({ top: top + this.padding })
        }
        else if ((top + height) > viewBottom) {
            this.scrollbar.viewport.nativeElement.scrollTo({ top: ((top + this.rowHeight) - viewHeight) + this.padding })
        }

        // Immediately check for changes to update template
        this.changeDetector.detectChanges();
    }

    executeCommand(command: CommandAction) {
        // Open a sub menu of items
        if (Array.isArray(command.subMenu)) {
            this.breadcrumbs.push({
                action: command,
                commands: command.subMenu,
                selectedIndex: this.activeIndex,
                destroying: false
            });

            this.setCommandList(command.subMenu);
        }
        // Directly invoke the action and kill the dialog
        else {
            this.commandPalette.invokeAction(command);
            this.dialog.close();
        }
    }

    @HostListener("window:blur")
    @HostListener("window:resize")
    onBlur() {
        if (!isDevMode()) {
            this.dialog.close();
        }
    }
}
