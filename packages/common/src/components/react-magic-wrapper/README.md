# ReactMagicWrapperComponent
> This component provides a simple interface for wrapping React components and automatically bootstrapping them in Angular applications.

### Getting started:

##### Install React

```bash
    npm i react react-dom
```

```bash
    npm i -D @types/react
```
##### Update tsconfig.json

Now add `"jsx": "react"` to your `tsconfig.json`
```json
{
  "compilerOptions": {
    "jsx": "react",
    ...
  },
  ...
}
```

##### Create Interface
Next, create a component interface to expose to the rest of your Angular app.
> This step is necessary as it creates Angular bindings that can be used.
> Important: You can't use the normal stylesheet imports from React. Put your styles in the component.scss file.

```ts
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import * as React from 'react';

import { ReactDemoWrappableComponent } from './react-demo'; // tsx file
import { ReactMagicWrapperComponent } from '@dotglitch/ngx-common';

@Component({
    selector: 'app-react-demo',
    template: ``,
    styleUrls: ['./react-demo.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None
})
export class ReactDemoComponent extends ReactMagicWrapperComponent {
    override readonly ngReactComponent = ReactDemoWrappableComponent;

    @Output() onNodeClick       = new EventEmitter<[MouseEvent, Node]>();
    @Output() onNodeDoubleClick = new EventEmitter<[MouseEvent, Node]>();

    @Input() nodeTypes?: NodeTypes | undefined;
    @Input() edgeTypes?: EdgeTypes | undefined;
}
```

##### Using the component

Last, import and use `ReactDemoComponent` elsewhere in your application.

```ts

import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ReactDemoComponent } from './react-demo.component';

@Component({
    selector: 'app-demo',
    template: `
<app-react-demo
    [nodeTypes]="[1,2,3,4]"
    (onNodeClick)="onNodeClick($event)"
/>
`,
    imports: [ ReactDemoComponent ],
    standalone: true
})
export class DemoComponent {

    onNodeClick(evt) {
        console.log(evt)
    }
}
```
