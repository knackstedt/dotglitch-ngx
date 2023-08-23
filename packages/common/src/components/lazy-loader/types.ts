import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';

export enum ComponentResolveStrategy {
    /**
     * Match the fist component we find
     * (best used for standalone components)
     * @default
     */
    PickFirst,
    /**
     * Perform an Exact ID to Classname of the Component
     * case sensitive, zero tolerance.
     */
    MatchIdToClassName,
    /**
     * Perform a fuzzy ID to classname match
     * case insensitive, mutes symbols
     * ignores "Component" and "Module" postfixes on class
     * names
     */
    FuzzyIdClassName,

    /**
     * Use a user-provided component match function
     */
    Custom
}

export type NgxLazyLoaderConfig = Partial<{
    entries: ComponentRegistration[],

    notFoundTemplate: TemplateRef<any>,
    notFoundComponent: ComponentType<any>,

    errorTemplate: TemplateRef<any>,
    errorComponent: ComponentType<any>,

    loaderDistractorTemplate: TemplateRef<any>,
    loaderDistractorComponent: ComponentType<any>,

    logger: {
        log: (...args: any) => void,
        warn: (...args: any) => void,
        err: (...args: any) => void;
    },
    /**
     * What strategy should be used to resolve components
     * @default ComponentResolveStrategy.FuzzyIdClassName
     */
    componentResolveStrategy: ComponentResolveStrategy,
    customResolver: (registry: (CompiledComponent | CompiledModule)[]) => Object
}>;

type RegistrationConfig = {
    /**
     * Specify a group to categorize components. If not specified,
     * will default to the `default` group.
     */
    group?: string,
    /**
     * load: () => import('./pages/my-page/my-page.component')
     */
    load: () => any,

    /**
     * Called before a component is loaded.
     * If it returns `false` the component will not be loaded.
     */
    // canActivate: () => boolean

    [key: string]: any
}

export type ComponentRegistration = (
    ({ id: string } & RegistrationConfig) |
    ({ matcher: string[] | RegExp | ((value: string) => boolean); } & RegistrationConfig)
);

export type DynamicRegistrationArgs<T = any> = {
    id: string,
    group?: string,
    matcher?: string[] | RegExp | ((val: string) => boolean),
    component?: T,
    load?: () => any;
}

/**
 * This is roughly a compiled component
 */
export type CompiledComponent = {
    (): CompiledComponent,
    ɵfac: Function,
    ɵcmp: {
        consts;
        contentQueries;
        data;
        declaredInputs;
        decls;
        dependencies;
        directiveDefs;
        encapsulation;
        exportAs;
        factory;
        features;
        findHostDirectiveDefs;
        getStandaloneInjector;
        hostAttrs;
        hostBindings;
        hostDirectives;
        hostVars;
        id: string;
        inputs;
        ngContentSelectors;
        onPush: boolean;
        outputs;
        pipeDefs;
        providersResolver;
        schemas;
        selectors: string[];
        setInput;
        standalone: boolean;
        styles: string[];
        tView;
        template;
        type: Function;
        vars: number;
        viewQuery;
    };
};

/**
 * This is roughly a compiled module
 */
export type CompiledModule = {
    (): CompiledModule,
    ɵfac: Function,
    ɵinj: {
        providers: any[],
        imports: any[];
    },
    ɵmod: {
        bootstrap: any[],
        declarations: Function[],
        exports: any[],
        id: unknown,
        imports: any[],
        schemas: unknown,
        transitiveCompileScopes: unknown,
        type: Function;
    };
};

export type CompiledBundle = { [key: string]: CompiledComponent | CompiledModule; };


