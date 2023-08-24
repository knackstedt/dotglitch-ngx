
# Monaco-Editor wrapper for Angular
> Because the world needed _yet another_ wrapper for monaco-editor.

This is a [Monaco Editor](https://github.com/microsoft/monaco-editor) wrapper library for Angular.

## Installation
You can install the library with [npm](https://npmjs.com).

### Angular 15+
```sh
    # Install ngx-bytemd and dependencies
    npm i monaco-editor @dotglitch/ngx-monaco-editor path-browserify  --save
```
    
## Getting started

Use NgxMonacoEditor in your project:

```typescript
import { Component } from '@angular/core';
import { VscodeComponent } from 'ngx-monaco-editor';

@Component({
    selector: 'app-test-component',
    template: `<ngx-vscode [(code)]="" language="json"></ngx-vscode>`
    imports: [
        ByteMDComponent
    ],
    standalone: true
})
export class TestComponent {
    code = JSON.stringify({
        key: "foobar",
        value: true,
        isFalsy: false,
        version: 8
    }, null, 4);
}
```

