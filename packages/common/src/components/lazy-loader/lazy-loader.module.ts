import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { NgxLazyLoaderConfig } from './types';
import { LazyLoaderComponent } from './lazy-loader.component';
import { LazyLoaderService, NGX_LAZY_LOADER_CONFIG } from './lazy-loader.service';

@NgModule({
    imports: [LazyLoaderComponent],
    exports: [LazyLoaderComponent]
})
export class LazyLoaderModule {
    public static forRoot(@Optional() config: NgxLazyLoaderConfig): ModuleWithProviders<LazyLoaderModule> {
        return ({
            ngModule: LazyLoaderModule,
            providers: [
                {
                    provide: NGX_LAZY_LOADER_CONFIG,
                    useValue: config
                },
                LazyLoaderService
            ]
        });
    }
}
