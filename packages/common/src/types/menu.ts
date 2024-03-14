import { TemplateRef, Type } from '@angular/core';
import { PopupOptions } from './popup';

type MenuTrigger = "click" | "dblclick" | "hover" | "contextmenu";

export type MenuOptions = Partial<PopupOptions & {
    /**
     * Which event should trigger the app menu.
     */
    trigger: MenuTrigger | MenuTrigger[];

    /**
     * Set to `true` to keep the menu open.
     */
    stayOpen: boolean,
}>;

export type BaseMenuItem<T = any, Q = object | number | string | boolean | bigint | symbol | undefined> = {
    /**
     * Label for the menu-item
     */
    label?: string

    /**
     * Custom angular template to use for the label
     * Alternatively accepts a lambda function
     */
    labelTemplate?: TemplateRef<any> | ((data: T, context: Q) => string)

    /**
     * Callback method that is called when a user activates
     * a context-menu item.
     * Use the `contextMenuData` decorator for passing data.
     */
    action?: (data: T, context: Q) => any,

    /**
     * Instead of an action, this item can be a hyperlink pointing to this URL
     * www.example.com/foo/bar.zip
     */
    link?: string,

    /**
     * When having a configured `link` property, this specifies the `target`
     * attribute applied to the link
     */
    linkTarget?: "_blank" | "_self" | "_parent" | "_top", // "framename"

    /**
     * Custom template function for resolving a link when the context menu
     * is opened
     */
    linkTemplate?: ((data: T, context: Q) => string),

    /**
     * Callback method that is called upon a context menu activation
     * that when it returns true, will show the item as disabled.
     */
    isDisabled?: (data: T, context: Q) => boolean,

    /**
     * Callback method that is called upon a context menu activation
     * that when returning false, will hide the menu item.
     */
    isVisible?: (data: T, context: Q) => boolean,

    /**
     * If a shortcut is set, the text-label.
     */
    shortcutLabel?: string,

    /**
     * Keyboard shortcut to activate this item.
     */
    // shortcut?: KeyCommand,

    /**
     * Icon to render on the left side of the item.
     * Can be a URL/URI (must include extension)
     * Or can be a material icon identifier.
     */
    icon?: string,

    /**
     * Callback to choose the icon used for an item.
     * Executed upon opening the menu.
     *
     * See `icon` for details.
     */
    iconTemplate?: ((data: T, context: Q) => string),

    /**
     * CSS color string to apply on the mat icon
     */
    iconColor?: string,

    /**
     * Optional child menu
     */
    children?: MenuItem<T>[] | ((data: T, context: Q) => MenuItem<T>[]) | ((data: T, context: Q) => Promise<MenuItem<T>[]>),

    /**
     * Optional resolver that dynamically loads the contents
     * for the menu item.
     * Can be used to dynamically determine the submenu contents
     */
    childrenResolver?: (data: T, context: Q) => Promise<MenuItem<T>[]>,

    /**
     * If `children` is a method or `childrenResolver` is provided
     * disable caching of
     * the resolved children.
     */
    cacheResolvedChildren?: boolean,

    /**
     * Instead of an array of children, render a template
     */
    childTemplate?: TemplateRef<any> | Type<any>,

    /**
     * Optional `context` that can be passed from the menu
     */
    context?: ((data: T) => Promise<Q>) |
              ((data: T) =>         Q) |
                                    Q

    /**
     * This item is a separator.
     * Can be used with label to make a label separator.
     */
    separator?: boolean;
};

export type MenuItem<T = any, Q = any> =
    BaseMenuItem<T, Q> |
    "separator";
