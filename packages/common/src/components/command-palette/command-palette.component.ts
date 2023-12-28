import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommandAction, CommandPaletteService } from '../../services/command-palette.service';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ShortcutComponent } from './shortcut/shortcut.component';

@Component({
    selector: 'app-command-palette',
    templateUrl: './command-palette.component.html',
    styleUrls: ['./command-palette.component.scss'],
    imports: [
        MatInputModule,
        ScrollingModule,
        NgScrollbarModule,
        ShortcutComponent
    ],
    standalone: true
})
export class CommandPaletteComponent implements OnInit {

    @Input() contextElement: HTMLElement;

    queryString = "";
    activeIndex = 0;

    commands: CommandAction[] = [];
    filteredCommands: CommandAction[] = [];

    constructor(
        private readonly commandPalette: CommandPaletteService,
        private readonly dialog: MatDialogRef<any>
    ) {

    }

    ngOnInit() {
        this.commands = this.commandPalette.getRegisteredCommands(this.contextElement);
        this.filteredCommands = this.commands;

        // Reset the filter labels
        this.commands.forEach(command => command['_renderedLabel'] = '');
    }

    onKeyDown(evt: KeyboardEvent) {
        if (evt.key == "Enter") {
            // Fire the first command
            if (this.filteredCommands.length > 0)
                this.executeCommand(this.filteredCommands[this.activeIndex]);

            return;
        }

        if (evt.key == "ArrowUp") {
            // Fire the first command
            this.activeIndex = Math.max(this.activeIndex-1, 0);
            return;
        }

        if (evt.key == "ArrowDown") {
            this.activeIndex = Math.min(this.filteredCommands.length, this.activeIndex+1)
            return;
        }

        this.activeIndex = 0;
        this.commands.forEach(c => c['_renderedLabel'] = '');

        setTimeout(() => {
            this.queryString = (evt.target as HTMLInputElement).value;

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
                        renderedLabel += label.slice(lastIndex, index) + `<b>${label.slice(index, index+1) }</b>`;
                        lastIndex = index+1;
                    }
                }

                renderedLabel += label.slice(lastIndex);

                if (isMatch) {
                    command['_renderedLabel'] = renderedLabel;
                    matchedCommands.push(command);
                }
            }

            this.filteredCommands = matchedCommands;
        })
    }

    executeCommand(command: CommandAction) {
        this.commandPalette.invokeAction(command);
        this.dialog.close();
    }

    @HostListener("window:blur")
    onBlur() {
        // this.dialog.close();
    }
}
