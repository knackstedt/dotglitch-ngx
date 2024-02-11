import { Component, Input } from '@angular/core';
import { CommandPaletteComponent } from '../command-palette.component';
import { CommandAction } from '../../../services/command-palette.service';

@Component({
    selector: 'ngx-commandpalette-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    standalone: true
})
export class BreadcrumbComponent {

    @Input() breadcrumbs: {
        action: CommandAction,
        commands: CommandAction[],
        destroying: boolean,
        selectedIndex: number
    }[] = [];

    constructor(
        private commandPalette: CommandPaletteComponent
    ) {

    }

    selectBreadcrumb(crumb) {
        const index = this.breadcrumbs.indexOf(crumb);
        if (index == -1)
            throw new Error("Something terrible happened.");

        const layer = this.breadcrumbs.at(-1);
        layer.destroying = true;
        setTimeout(() => {
            this.commandPalette.setCommandList(this.breadcrumbs.at(-2).commands);
            this.commandPalette.breadcrumbs.pop();
            this.commandPalette.activeIndex = layer.selectedIndex;
        }, 190)
    }
}
