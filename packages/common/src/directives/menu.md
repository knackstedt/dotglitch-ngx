Quickstart 
=====

[Demo and examples](https://dotglitch.dev/#/ContextMenuLibrary)


### Import the Module

```typescript
import { NgModule } from '@angular/core';
import { NgxMenuDirective } from '@dotglitch/ngx-common';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        NgxMenuDirective,
        ...
    ]
    bootstrap: [AppComponent]
})
export class AppModule { }
```

### Basic Usage
> `Context menus` show up when a user right-clicks a specific element in a given application.
> `App menus` are menus that show up on buttons when you click them. The support provided by this package is for convenience of feature support, allowing you to make context menus that also appear when buttons are pressed, which is very useful for mobile development or in cases where complex button menus are required.

`component.html`
```html
<ul>
    <!-- Bind the context menu to the list item -->
    <li *ngFor="let item of items" [ngx-common]="actionMenu" [ngx-common-context]="item">
        
        <!-- Bind the same menu to a button that can easily be clicked on mobile -->
        <button mat-icon-button [ngx-app-menu]="actionMenu" [ngx-app-menu-context]="item">
            <mat-icon>more_vert</mat-icon>
        </button>

        <div>
            Item: {{item}}
        </div>
    </li>
</ul>
```

`component.ts`
```ts
import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MenuItem } from '@dotglitch/ngx-common';

@Component({
    selector: 'app-tag-picker',
    templateUrl: './tag-picker.component.html',
    styleUrls: ['./tag-picker.component.scss'],
    imports: [
        NgForOf,
        MatButtonModule,
        NgxMenuDirective
    ],
    standalone: true
})
export class SimpleComponent {

    // For the sake of this example, this has no action handlers.
    actionMenu: MenuItem<MyDataObject>[] = [
        {
            label: "Duplicate",
            icon: "add"
        },
        {
            label: "Edit",
            icon: "edit"
        },
        "separator",
        {
            label: "Delete",
            icon: "delete_outline"
        },
    ];

    items = [
        "item1",
        "item2",
        "item3",
        "item4",
        "item5"
    ]
}

```


Configuration
=====

You can set configuration options on the App menu for where it should pop-up relative to the parent element.

```html
<button mat-button [ngx-app-menu]="createMenu" [ngx-app-menu-config]="{ position: 'bottom', alignment: 'center' }">
    <mat-icon>add</mat-icon>
    New Item
</button>
```
```ts

export type MenuOptions = Partial<{
    /**
     * Position relative to the element the menu pops-up at
     * @default 'right'
     */
    position: "top" | "right" | "bottom" | "left",
    /**
     * How the popup is aligned relative to the element
     * @default 'center'
     */
    alignment: "center" | "beforestart" | "start" | "end" | "afterend",
    /**
     * How much padding to add near the edges of the screen.
     */
    edgePadding: number,
    /**
     * Which event should trigger the app menu
     * @default 'click'
     */
    trigger: NgxAppMenuTriggers | NgxAppMenuTriggers[];
}>;
```


Styling
=====

```scss
// You can use CSS variables to configure colors:
--ngx-common-background-color: #000000;
--ngx-common-text-color: #000000;
--ngx-common-hover-background-color: #000000;
--ngx-common-hover-text-color: #000000;
--ngx-common-disabled-text-color: #000000;
--ngx-common-separator-color: #000000;
--ngx-common-shortcut-text-color: #000000;
```


Debugging
=====

### The menu isn't bound
- Did you import the module?
- Does the input json object have any entries?
- Is there a global `contextmenu` handler that's interrupting events?

Roadmap
=====
  - [*] Basic menu template support
  - [*] Support for better styling
  - [*] Support for templates without relying on `@ViewChild`
  - [*] Add more trigger events for app menu
  - [ ] Better ARIA support and configuration
  - [*] Support dynamic entries
  - [ ] Enable sharing menus and combining menu chunks
