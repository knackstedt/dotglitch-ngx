
# Reactflow wrapper for Angular

[![npm](https://img.shields.io/npm/v/ngx-reactflow.svg)](https://www.npmjs.com/package/ngx-reactflow)
[![npm](https://img.shields.io/npm/dm/ngx-reactflow.svg)](https://www.npmjs.com/package/ngx-reactflow)
[![npm downloads](https://img.shields.io/npm/dt/ngx-reactflow.svg)](https://npmjs.org/ngx-reactflow)
[![GitHub stars](https://img.shields.io/github/stars/knackstedt/dotglitch-ngx.svg?label=GitHub%20Stars&style=flat)](https://github.com/knackstedt/dotglitch-ngx)


This is a [Reactflow](https://github.com/wbkd/react-flow) wrapper library for Angular.


| :warning:        This library is still in alpha stages, some things may not work correctly.   |
|-----------------------------------------|
| If you find any bugs, please open a [PR](https://github.com/knackstedt/dotglitch-ngx/issues). |

## Installation
You can install the library with [npm](https://npmjs.com).

### Angular 15+
```sh
    # Install ngx-reactflow and dependencies
    npm i ngx-reactflow reactflow react-dom react --save

    # Install type definitions
    npm i -D @types/react@18 @types/react-dom@18
```

> You will also want to set `useDefineForClassFields: false` in your tsconfig.json

## Getting started

Use NgxReactflow in your project:

```typescript
import { Component } from '@angular/core';
import { ReactflowComponent } from 'ngx-reactflow';
import { Node, Edge } from 'reactflow';

@Component({
    selector: 'app-test-component',
    template: `<ngx-reactflow></ngx-reactflow>`,
    imports: [
        ReactflowComponent
    ],
    standalone: true
})
export class TestComponent {
    nodes: Node<any, string | undefined>[] = [];
    edges: Edge<any>[] = [];
}
```


## Using Custom nodes

