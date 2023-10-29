import { InjectionToken } from '@angular/core';

export const NGX_WEB_COMPONENTS_CONFIG = new InjectionToken<NgxWebComponentsConfig>('webcomponents-config');

export type NgxWebComponentsConfig = Partial<{
    /**
     * The path that assets will ultimately be served from.
     * Default `/assets/`
     */
    assetPath: string
}>;


export type FileSorting = "a-z" | "z-a" | "lastmod" | "firstmod" | "size" | "type";
