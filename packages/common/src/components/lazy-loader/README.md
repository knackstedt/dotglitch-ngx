Quickstart 
=====

### Import with App Module

```typescript
import { NgModule } from '@angular/core';
import { NgxLazyLoaderModule } from '@dotglitch/ngx-common';
import { ProgressDistractorComponent } from './@framework/progress-distractor/progress-distractor.component';
import { NotFoundComponent } from './@framework/not-found/not-found.component';
import { ErrorComponent } from './@framework/error/error.component';
import { Pages } from 'src/app/page.registry';
import { Dialogs } from 'src/app/dialog.registry';
import { Charts } from 'src/app/chart.registry';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        ...
        NgxLazyLoaderModule.forRoot({
            entries: [
                ...Pages,
                ...Dialogs,
                ...Charts
            ],
            loaderDistractorComponent: ProgressDistractorComponent,
            errorComponent: ErrorComponent,
            notFoundComponent: NotFoundComponent
        })
    ]
    bootstrap: [AppComponent]
})
export class AppModule {
}
```

<!-- ### Import with App Component

```typescript
import { Component } from '@angular/core';
import { NgxLazyLoaderModule } from '@dotglitch/ngx-common';
import { RegisteredComponents } from 'src/app/component.registry';

@Component({
    ...
    imports: [
        ...
        NgxLazyLoaderModule.forRoot({
            entries: RegisteredComponents
        })
    ,
    standalone: true
})
export class AppComponent { }
```

component.registry.ts: 
```ts
import { ComponentRegistration } from '@dotglitch/ngx-common';

export const RegisteredComponents: ComponentRegistration[] = [
    // Landing page -- neat.
    { id: 'Landing', load: () => import('src/app/pages/general/landing/landing.component'), icon: "home", order: 0 },
    // About page
    { id: 'About', load: () => import('src/app/pages/general/about/about.component'), icon: "info", order: 10000 },
    // Terms of use is a dialog
    { id: 'TermsOfUse', load: () => import('src/app/pages/general/termsofuse/termsofuse.component'), hidden: true },
]
```
> Notice that this has additional properties `icon`, `order` and `hidden`. These are used 
> by the client application to render menus and are ignored by ngx-common.
 -->

### Loading a Component
```html
<ngx-common
    component="TestChild"
    group="MyNonDefaultGroup"
    [inputs]="{
        prop1: value1,
        prop2: value2
    }"
    [outputs]="{
        buttonClicked: onChildButtonClicked.bind(this)
    }"
/>
```
> As of release 0.0.17, outputs must be bound with .bind(this). We're working on improvements, but this is the most stable fix so far.

<!--
Examples
=====

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/avajs/ava/tree/main/examples/typescript-basic?file=source%2Ftest.ts&terminal=test&view=editor)
-->

Configuration
=====

```ts
NgxLazyLoaderModule.forRoot({
    /**
     * A list of lazy-loadable component registrations that we will
     * initialize with. This list can be added to during runtime.
     * Adding a component _after_ loading it via the lazy loader 
     * will not auto-resolve the component off of the notFoundComponent
     */
    entries: RegisteredComponents,
    /**
     * A component to show when the loader can't resolve a provided ID
     */
    notFoundComponent,
    /**
     * WIP: A component to show when something functionally fails when
     * bootstrapping a lazy-loadable component. 
     * > usually happens in the constructor 
     */
    errorComponent,
    /**
     * A component to show as a progress spinner / distractor
     */
    loaderDistractorComponent,
    /**
     * What strategy should be used to resolve components
     * @default ComponentResolveStrategy.FuzzyIdClassName
     */
    componentResolveStrategy: ComponentResolveStrategy,
    /**
     * When `componentResolveStrategy` is set to `Custom`,
     * the method that identifies which component to resolve to.
     */
    customResolver: (registry: (CompiledComponent | CompiledModule)[]) => Object
})
```

### Component Grouping
If you use a lot of components all over the place, you may need to group lazy-loadable 
components in order to organize them and ensure that you don't encounter conflicts.

All you need to do when registering the component is add the group property:

component.registry.ts: 
```ts
import { ComponentRegistration } from '@dotglitch/ngx-common';

export const RegisteredComponents: ComponentRegistration[] = [
    // Components are added into the "default" group unless otherwise specified.
    { id: 'Landing', load: () => import('src/app/pages/general/landing/landing.component')},
    { id: 'About', load: () => import('src/app/pages/general/about/about.component')},

    { id: 'TermsOfUse', group: "dialog", load: () => import('src/app/pages/general/termsofuse/termsofuse.component') },
    { id: 'PrivacyPolicy', group: "dialog", load: () => import('src/app/pages/general/privacypolicy/privacypolicy.component') },

    { id: 'barchart', group: "chart", load: () => import('src/app/@charts/barchart/barchart.component')},
    { id: 'piechart', group: "chart", load: () => import('src/app/@charts/piechart/piechart.component')},
    { id: 'areachart', group: "chart", load: () => import('src/app/@charts/areachart/areachart.component')},
    { id: 'mapchart', group: "chart", load: () => import('src/app/@charts/mapchart/mapchart.component')},
    { id: 'histogram', group: "chart", load: () => import('src/app/@charts/histogram/histogram.component')},

    // You can overlap IDs as long as they have different groups
    { id: 'barchart', group: "dashboardtile", load: () => import('src/app/pages/dashboard/@tiles/barchart/barchart.component')},
    { id: 'piechart', group: "dashboardtile", load: () => import('src/app/pages/dashboard/@tiles/piechart/piechart.component')},
    { id: 'areachart', group: "dashboardtile", load: () => import('src/app/pages/dashboard/@tiles/areachart/areachart.component')},
    { id: 'mapchart', group: "dashboardtile", load: () => import('src/app/pages/dashboard/@tiles/mapchart/mapchart.component')},
    { id: 'histogram', group: "dashboardtile", load: () => import('src/app/pages/dashboard/@tiles/histogram/histogram.component')},
]
```

Then, you just need to add the group when you reference the component: 

```html
<ngx-common
    component="TestChild"
    [inputs]="{
        prop1: value1,
        prop2: value2,
        prop5: 'asd',
        complex: complicated,
        myExternalKey: 'balloon',
        ...
    }"
    [outputs]="{
        prop3: onOutputFire,
        buttonClicked: onChildButtonClicked,
        ...
    }"
/>

```


### Using ID Matchers
```ts
const registry: ComponentRegistration[] = [
    {
        group: "editor",
        matcher: [
            "fruit",
            "vegetables",
            "legumes"
        ],
        height: "750px",
        width: "1450px",
        load: () => import('src/app/pages/food-editor.component')
    },
    
    // This catches any value that doesn't exist on the previous matcher in the same group.
    // Order of these entries matters.
    {
        group: "editor",
        matcher: /.*/,
        height: "700px",
        width: "500px",
        load: () => import('src/app/pages/generic-editor.component')
    },
    ...


    {
        group: "dialogs",
        // Custom matchers can be provided, and will check against the original input
        matcher: (value: string) => value.contains("-dialog") && !value.contains("navigation"),
        height: "750px",
        width: "1450px",
        load: () => import('src/app/pages/@dialogs/confirmation.component')
    },
    // If using matchers and no match can be made, the standard NotFound component/template is loaded
]
```

> This example contains additional properties on the registrations. When these are present, getting the matched component by running `this.lazyLoader.resolveRegistrationEntry(name, opts.group || "default")` from a DI injected instance of `private lazyLoader: NgxLazyLoaderService` will return the original entry. This can be used to additionally change parts of the UI as necessary.

Debugging
=====

### My Component doesn't load
- Look for formatted console logs.

### Component could not be resolved
- Make sure the component is registered and the registry is imported in your app.module
- Make sure the registration id is valid
- Make sure the registration group is the same as in the HTML attribute `<ngx-common group="group1"/>`
- Check the registration matchers
- Check the specified component selector

> Matchers slugify the strings that they check
