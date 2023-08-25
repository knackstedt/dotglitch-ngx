
# Tabulator wrapper for Angular

[![npm](https://img.shields.io/npm/v/@dotglitch/dotglitch-ngx.svg)](https://www.npmjs.com/package/@dotglitch/dotglitch-ngx)
[![npm](https://img.shields.io/npm/dm/@dotglitch/dotglitch-ngx.svg)](https://www.npmjs.com/package/@dotglitch/dotglitch-ngx)
[![npm downloads](https://img.shields.io/npm/dt/@dotglitch/dotglitch-ngx.svg)](https://npmjs.org/@dotglitch/dotglitch-ngx)
[![GitHub stars](https://img.shields.io/github/stars/knackstedt/dotglitch-ngx.svg?label=GitHub%20Stars&style=flat)](https://github.com/knackstedt/dotglitch-ngx)


This is a [Tabulator](https://github.com/olifolkerd/tabulator) wrapper library for Angular.


| :warning:        This library is still in alpha stages, some things may not work correctly.   |
|-----------------------------------------|
| If you find any bugs, please open a [PR](https://github.com/knackstedt/dotglitch-ngx/issues). |

## Installation
You can install the library with [npm](https://npmjs.com).

### Angular 15+
```sh
    npm i ngx-tabulator tabulator-tables
    npm i -D @types/tabulator-tables
```
    
## Getting started

Use NgxByteMD in your project:

```typescript
import { Component } from '@angular/core';
import { TabulatorComponent } from 'ngx-tabulator';

@Component({
    selector: 'app-test-component',
    template: `<ngx-tabulator></ngx-tabulator>`,
    imports: [
        TabulatorComponent
    ],
    standalone: true
})
export class TestComponent {
}
```

