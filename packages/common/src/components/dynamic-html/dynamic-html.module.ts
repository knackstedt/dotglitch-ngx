import { NgModule, ModuleWithProviders } from '@angular/core';
import { DynamicHTMLComponent } from './dynamic-html.component';
import { DynamicHTMLOptions, NGX_DYNAMIC_CONFIG } from './types';
import { DynamicHTMLRenderer } from './dynamic-html.service';

@NgModule({
    imports: [DynamicHTMLComponent],
    exports: [DynamicHTMLComponent],
})
export class NgxDynamicHTMLModule {
    public static forRoot(config: DynamicHTMLOptions): ModuleWithProviders<NgxDynamicHTMLModule> {
        return {
            ngModule: NgxDynamicHTMLModule,
            providers: [
                DynamicHTMLRenderer,
                { provide: NGX_DYNAMIC_CONFIG, useValue: config }
            ],
        };
    }
}
