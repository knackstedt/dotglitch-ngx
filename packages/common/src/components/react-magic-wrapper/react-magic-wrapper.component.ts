import { AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, EnvironmentInjector, EventEmitter, Injector, OnChanges, OnDestroy, SimpleChanges, Type, ViewContainerRef, ViewRef, createComponent } from '@angular/core';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';

import { ThemeService } from '../../services/theme.service';
import { ulid } from 'ulidx';
import { Subscription } from 'rxjs';

/**
 * Extend this component to automatically generate
 * bindings to a React component.
 *
 * ! You _must_ override the property `ngReactComponent`
 * Failure to do so will result in errors
 * `override readonly ngReactComponent = ReactFlowWrappableComponent;`
 */
@Component({
    selector: 'app-react-magic-wrapper',
    template: ``,
    standalone: true
})
export class ReactMagicWrapperComponent implements OnChanges, OnDestroy, AfterViewInit {

    /**
     * Wrap an angular component inside of a React memo object.
     * Will attempt to bind @Input and @Output properties if provided,
     * and will bind the react arguments directly as @Input properties.
     *
     * @experimental
     * @param componentClass Angular component
     * @param envInjector    An `EnvironmentInjector` instance to be used for the component
     * @param injector       An `ElementInjector` instance
     * @param _inputs
     * @param _outputs
     * @returns
     */
    static WrapAngularComponent = (
        componentClass: Type<any>,
        appRef: Omit<ApplicationRef, '_runningTick'>,
        injector: Injector,
        _inputs: { [key: string]: any } = {},
        _outputs: { [key: string]: Function } = {},
        additionalChildren: React.ReactNode[] = []
    ) => React.memo((args) => {

        const id = ulid();
        React.useEffect(() => {
            const component = createComponent(componentClass, {
                environmentInjector: appRef.injector,
                elementInjector: injector,
                hostElement: document.getElementById(id)
            });

            appRef.attachView(component.hostView);
            // @ts-ignore
            // component.hostView = hostView;

            Object.assign(_inputs, args);

            const { inputs, outputs } = componentClass['ɵcmp'];

            // Returns a list of entries that need to be set
            // This makes it so that unnecessary setters are not invoked.
            const updated = Object.entries(inputs).filter(([parentKey, childKey]: [string, string]) => {
                return component.instance[childKey] != _inputs[parentKey];
            });

            updated.forEach(([parentKey, childKey]: [string, string]) => {
                if (_inputs.hasOwnProperty(parentKey))
                    component.instance[childKey] = _inputs[parentKey];
            });

            const outputSubscriptions: { [key: string]: Subscription } = {};
            // Get a list of unregistered outputs
            const newOutputs = Object.entries(outputs).filter(([parentKey, childKey]: [string, string]) => {
                return !outputSubscriptions[parentKey];
            });

            // Reverse bind via subscription
            newOutputs.forEach(([parentKey, childKey]: [string, string]) => {
                if (_outputs.hasOwnProperty(parentKey)) {
                    const target: EventEmitter<unknown> = component.instance[childKey];
                    const outputs = _outputs;

                    const sub = target.subscribe(outputs[parentKey]); // Subscription

                    outputSubscriptions[parentKey] = sub;
                }
            });

            // Wrap the destroy method to safely release the subscriptions
            const originalDestroy = component.onDestroy?.bind(component);
            component.onDestroy = (cb) => {
                Object.values(outputSubscriptions).forEach(s => s.unsubscribe());
                originalDestroy?.(cb);
            }

            component.changeDetectorRef.detectChanges();
        }, []);

        // Create a container for the wrapped element and
        // all of the siblings we will inject into it's container.
        // The double wrapper is necessary for React's mechanisms to properly
        // associate things together.
        return React.createElement('div',
            {},
            React.createElement("div", { id }),
            ...additionalChildren
        );
    });

    /**
     * The react component to be wrapped.
     * ! Must be overridden for this wrapper to work
     */
    ngReactComponent: React.FunctionComponent<any> | React.ComponentClass<any> | string;

    private _root: Root;
    public theme: string;
    private ngSubscriptions = [
        this.ngTheme.subscribe(t => {
            this.theme = t;
            this.ngOnChanges();
        })
    ];

    constructor(
        private ngContainer: ViewContainerRef,
        private ngTheme: ThemeService
    ) {
    }

    ngOnInit() {
        if (!this.ngReactComponent)
            throw new Error("ReactMagicWrapperComponent cannot start without a provided ngReactComponent!");
    }

    ngOnChanges(changes?: SimpleChanges): void {
        this._render();
    }

    ngAfterViewInit() {
        this._render();
    }

    ngOnDestroy() {
        this._root.unmount();
        this.ngSubscriptions.forEach(s => s.unsubscribe());
    }

    private _render() {
        if (!this.ngReactComponent) return;
        if (!this._root) {
            this._root = createRoot(this.ngContainer.element.nativeElement);
        }

        // List all keys that do not start with `_` nor `ng`
        const keys = Object.keys(this).filter(k => !/^(?:_|ng)/.test(k));

        // Get all property keys from the class
        const propKeys = keys.filter(k => !k.startsWith("on"));
        // Get all event handler keys from the class
        const evtKeys = keys.filter(k => k.startsWith("on"));

        const props = {};
        // Project all key properties onto `props`
        propKeys.forEach(k => props[k] = this[k]);

        // Bind all event handlers.
        // ! important Angular uses EventEmitter, React uses
        // a different method of event binding
        evtKeys.forEach(k => props[k] = (...args) => this[k].next(args));

        this._root.render(React.createElement(this.ngReactComponent, { props: props as any }));
    }
}
