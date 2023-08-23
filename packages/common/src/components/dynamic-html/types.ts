import { InjectionToken, Type } from '@angular/core';

export abstract class OnMount {
    abstract dynamicOnMount(attrs?: Map<string, string>, content?: string, element?: Element): void;
}

export interface ComponentWithSelector {
    selector: string;
    component: Type<any>;
}
export class DynamicHTMLOptions {
    components: Array<ComponentWithSelector>;
}

export const NGX_DYNAMIC_CONFIG = new InjectionToken<DynamicHTMLOptions>('config');

