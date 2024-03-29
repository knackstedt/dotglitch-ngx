/*
 * Public API Surface of package
 */

/**
 ** Types
 */
export * from './types/menu';
export * from './types/popup';

/**
 ** Directives
 */
export * from './directives/tooltip.directive';
export * from './directives/menu.directive';
export * from './directives/image-cache.directive';

/**
 ** Pipes
 */
export * from './pipes/html-bypass.pipe';
export * from './pipes/resource-bypass.pipe';
export * from './pipes/script-bypass.pipe';
export * from './pipes/style-bypass.pipe';
export * from './pipes/url-bypass.pipe';

/**
** Services
*/
export * from './services/dependency.service';
export * from './services/dialog.service';
export * from './services/fetch.service';
export * from './services/keyboard.service';
export * from './services/file.service';
export * from './services/theme.service';
export * from './services/navigation.service';
export * from './services/command-palette.service';
// export * from './services/serviceworker.service';

/**
** Lazy loader component & service
*/
export * from './components/lazy-loader/lazy-loader.service';
export * from './components/lazy-loader/lazy-loader.module';
export * from './components/lazy-loader/lazy-loader.component';
export * from './components/lazy-loader/types';

/**
** Dynamic HTML (WIP)
*/
export * from './components/dynamic-html/dynamic-html.service';
export * from './components/dynamic-html/dynamic-html.module';
export * from './components/dynamic-html/dynamic-html.component';
export * from './components/dynamic-html/types';

/**
 ** Components
 */
export * from './components/filemanager/filemanager.component';
// export * from './components/music-library/music-library.component';
export * from './components/tabulator/tabulator.component';
// export * from './components/overlay-wrapper/overlay-wrapper.component';
export * from './components/vscode/vscode.component';
export * from './components/parallax-card/parallax-card.component';
export * from './components/react-magic-wrapper/react-magic-wrapper.component';
export * from './components/menu/menu.component';
export * from './components/types';


export { ConsoleLogger, LogIcon } from './utils/index';
