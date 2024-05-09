import { Injectable, HostListener, Type, isDevMode } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConsoleLogger, LogIcon } from '../utils';
import { LazyLoaderService } from '../components/lazy-loader/lazy-loader.service';
import { CommandPaletteComponent } from '../components/command-palette/command-palette.component';

const { log, warn, err } = ConsoleLogger("CommandPalette", "#2196f3");

type KeyCode = "Backspace" | "Tab" | "Enter" | "ShiftLeft" | "ShiftRight"
    | "ControlLeft" | "ControlRight" | "AltLeft" | "AltRight" | "Pause" | "CapsLock"
    | "Escape" | "Space" | "PageUp" | "PageDown" | "End" | "Home" | "ArrowLeft"
    | "ArrowUp" | "ArrowRight" | "ArrowDown" | "PrintScreen" | "Insert" | "Delete"
    | "MetaLeft" | "MetaRight" | "ContextMenu" | "Numpad0" | "Numpad1" | "Numpad2"
    | "Numpad3" | "Numpad4" | "Numpad5" | "Numpad6" | "Numpad7" | "Numpad8"
    | "Numpad9" | "NumpadMultiply" | "NumpadAdd" | "NumpadSubtract"
    | "NumpadDecimal" | "NumpadDivide"
    | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" | "F10" | "F11" | "F12"
    | "NumLock" | "ScrollLock" | "Semicolon" | "Equal" | "Comma" | "Minus"
    | "Period" | "Slash" | "Backquote" | "BracketLeft" | "Backslash"
    | "BracketRight" | "Quote" | "backspace" | "tab" | "enter" | "shiftleft"
    | "shiftright" | "controlleft" | "controlright" | "altleft" | "altright"
    | "pause" | "capslock" | "escape" | "space" | "pageup" | "pagedown" | "end"
    | "home" | "arrowleft" | "arrowup" | "arrowright" | "arrowdown" | "printscreen"
    | "insert" | "delete" | "metaleft" | "metaright" | "contextmenu"
    | "numpad0" | "numpad1" | "numpad2" | "numpad3" | "numpad4" | "numpad5"
    | "numpad6" | "numpad7" | "numpad8" | "numpad9" | "numpadmultiply" | "numpadadd"
    | "numpadsubtract" | "numpaddecimal" | "numpaddivide"
    | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12"
    | "numlock" | "scrolllock" | "semicolon" | "equal" | "comma" | "minus" | "period"
    | "slash" | "backquote" | "bracketleft" | "backslash" | "bracketright" | "quote"
    | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
    | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
    | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m"
    | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";

// ctrl+alt+meta+shift
type KeyPrefix =
    `ctrl` |
    `ctrl+alt` |
    `ctrl+alt+shift` |
    `ctrl+alt+shift+meta` |
    `ctrl+alt+meta` |
    `ctrl+shift` |
    `ctrl+shift+meta` |
    `ctrl+meta` |
    `alt` |
    `alt+shift` |
    `alt+shift+meta` |
    `alt+meta` |
    `shift` |
    `shift+meta` |
    `meta`

export type KeybindEvent = (e: KeyboardEvent) => void;
export type KeybindCode = `${KeyPrefix}+${KeyCode}` | KeyCode;



export type CommandAction<T = any> = {
    /**
     * The non-modifier key(s) that must be pressed for the event to fire.
     */
    shortcutKey?: KeybindCode | KeybindCode[],

    /**
     * Action that is invoked when the keyboard shortcut is pressed or the item
     * is activated in the GUI menu
     * If the GUI menu is open, it will show a spinner if the action returns a `Promise`
     */
    action?: (evt: KeyboardEvent, data?: T) => Promise<any> | any,

    /**
     * Arbitrary data object to be passed into the action
     */
    data?: T,

    /**
     * Label in the command palette popup
     */
    label?: string,

    /**
     * Hint that follows the label, subtly
     */
    hint?: string,

    /**
     * Icon for the entry
     * Can be a mat-icon
     * Will be a mat-icon if the string is simple
     * If the string contains a slash or colon, it will be loaded as
     * an image source
     */
    icon?: string,

    /**
     * Keywords that can help pick this command
     */
    keywords?: string | string[],

    /**
     * Description for the popup
     * WIP
     */
    description?: string,

    /**
     * The root ancestor element of the action
     * (This allows scoping commands to specific HTML elements)
     * This requires that the event target must be a descendant
     *
     * If there are multiple matching descendants, only
     * the furthest descendant will be fired
     *
     * For command scoping, we read the data-label attribute
     * Alternatively, you can set label and element as an object here.
     */
    rootElement?: HTMLElement | string | {
        element: HTMLElement | string,
        label: string
    },

    /**
     * The label for the root. Used for the UI control and debugging.
     */
    rootName?: string,

    /**
     * Control whether this command action is visible in the popup command
     * palette GUI.
     */
    visibleInList?: boolean,

    /**
     * Enable selecting an item to show a list of sub-items
     */
    subMenu?: CommandAction<T>[] | (() => Promise<CommandAction<T>[]>) | (() => CommandAction<T>[])

};

type CommandBlock = {
    element: HTMLElement,
    actions: CommandAction[];
};

export type CommandPaletteOptions = {
    keybind: KeybindCode
}

@Injectable({
    providedIn: 'root'
})
export class CommandPaletteService {

    private commandBlocks: CommandBlock[] = [];
    private interval;

    constructor(
        private readonly dialog: MatDialog,
        private readonly lazyLoader: LazyLoaderService
    ) {
        window.addEventListener("keydown", (evt) => this.onKeyDown(evt));

        this.interval = setInterval(() => {
            // Go backwards since we're splicing items out of the array.
            for (let i = this.commandBlocks.length; i >= 0; i--) {
                let commandBlock = this.commandBlocks[i];

                // If the current index is somehow null, rip it out of
                // the array and wait for cleanup to trigger again
                // for the rest of the array.
                // TODO: Could this lead to leaks where things at the end
                // never get cleaned?
                if (commandBlock == null) {
                    this.commandBlocks.splice(i, 1);
                    return;
                }

                // If the element has been disconnected from the DOM, we will
                // treat it as having been permanently removed.
                // TODO: Could this ever cause unintended consequences?
                if (!commandBlock?.element.isConnected)
                    this.commandBlocks.splice(i, 1);
            }
        }, 5 * 60 * 1000);
    }

    private ngOnDestroy() {
        clearInterval(this.interval);
    }

    private getCommandBlocks(element: HTMLElement = document.body) {
        const elementPath: HTMLElement[] = [element];
        let currentTarget: HTMLElement = element;
        do {
            elementPath.unshift(currentTarget = currentTarget.parentElement);
        } while (currentTarget.parentElement);

        // Ordered matching command blocks, closest first
        const matchingCommandBlocks: CommandBlock[] = [];
        for (const element of elementPath) {
            const commandBlock = this.commandBlocks.find(cb => cb.element == element);
            if (commandBlock) {
                matchingCommandBlocks.unshift(commandBlock);
            }
        }

        return matchingCommandBlocks;
    }

    /**
     * Handle keydown events
     *
     * If an event has been removed from the DOM tree, we don't need
     * to explicitly remove the bindings, as they will never fire
     *
     * We periodically check and remove unconnected command blocks
     */
    private onKeyDown(evt: KeyboardEvent) {
        const matchingCommandBlocks = this.getCommandBlocks(evt.target as HTMLElement);

        // String in format `ctrl+alt+F`, `ctrl+F` etc.
        const key = [
            evt.ctrlKey ? "ctrl" : undefined,
            evt.altKey ? "alt" : undefined,
            evt.shiftKey ? "shift" : undefined,
            evt.metaKey ? "meta" : undefined,
            evt.code.startsWith("Key") ? evt.key : evt.code
        ].filter(a => a).join('+').toLowerCase();

        for (const commandBlock of matchingCommandBlocks) {
            const action = commandBlock.actions.find(a => {
                return Array.isArray(a.shortcutKey)
                    ? a.shortcutKey.includes(key as any)
                    : a.shortcutKey == key as any
            });

            if (action) {
                evt.stopPropagation();
                evt.preventDefault();

                this.invokeAction(action);

                // Execute the action and move on.
                return;
            }
            // Keep checking for matching actions
        }

        // If execution reaches this point, there were no matching actions on the
        // path of elements that were registered.
    }

    private addCommand(element: HTMLElement, action: CommandAction) {
        const commandBlock = this.commandBlocks.find(b => b.element == element) ?? (() => {
            const cb = { element, actions: [] };
            this.commandBlocks.push(cb);
            return cb;
        })();

        // This is likely a duplicate entry
        if (commandBlock.actions.find(a => a.shortcutKey && a.shortcutKey == action.shortcutKey)) {
            warn(`Inserting duplicate action on element`, { element, action });
        }
        else {
            // log(LogIcon.circle_blue, `Inserted action`, action)
        }

        // Make the shortcut keys lowercase so case sensitivity doesn't scalp someone
        if (action.shortcutKey) {
            if (Array.isArray(action.shortcutKey))
                action.shortcutKey = action.shortcutKey.map(k => k.toLowerCase()) as any;
            else
                action.shortcutKey = action.shortcutKey.toLowerCase() as any;
        }

        commandBlock.actions.push(action);
    }

    private removeCommand(element: HTMLElement, action: CommandAction | string) {
        const commandBlock = this.commandBlocks.find(b => b.element == element) ?? { element, actions: [] };
        const actionIndex = commandBlock?.actions.findIndex(a => typeof action == "string" ? a.shortcutKey == action : a == action);

        if (!commandBlock) {
            err(LogIcon.warning, `Cannot remove command: element does not have any commands registered`, { element, action })
        }
        else if (actionIndex == -1) {
            warn(LogIcon.warning, `Cannot remove command: not present in list`, { element, action })
        }
        else {
            commandBlock.actions.splice(actionIndex, 1);
        }
    }

    /**
     *
     */
    initialize(options: CommandPaletteOptions) {
        this.attachElementCommands([
            {
                shortcutKey: options.keybind,
                action: () => this.openPalette(),
                description: "Open the command palette",
                keywords: ["command", "prompt", "console", "actions"],
                label: "Command Palette",
                visibleInList: false
            }
        ]);
    }

    /**
     * Open the command palette
     */
    openPalette() {
        return this.dialog.open(CommandPaletteComponent, {
            position: {
                top: "8px"
            },
            data: {
                contextElement: document.activeElement
            },
            panelClass: ['ngx-command-palette'],
            backdropClass: ['ngx-command-palette'],
            restoreFocus: true,
            role: 'dialog'
        });
    }

    /**
     * Public helper to invoke an action.
     */
    invokeAction(action: CommandAction, args?) {
        const fn = action.action;
        if (typeof fn == 'function') {

            try {
                const res = fn(args);

                // Handle promises so that the GUI can show spinners for them
                if (res instanceof Promise) {
                    // TODO
                }
                else {
                    // TODO
                }
            }
            catch (ex) {
                err(LogIcon.bomb, `Executing action threw an error`, { action }, ex);
            }
        }
        else {
            warn(LogIcon.warning, `Cannot execute action, type is not "function"`, { action });
        }
    }

    /**
     * Attach commands to an Element and it's subtree
     */
    attachElementCommands(actions: CommandAction[])
    attachElementCommands(element: HTMLElement, actions: CommandAction[])
    attachElementCommands(element: CommandAction[] | HTMLElement = document.body, actions: CommandAction[] = []) {
        if (Array.isArray(element)) {
            actions = element;
            element = document.body;
        }

        actions.forEach(a => this.addCommand(element as any, a));
    }

    /**
     * Detach specified commands from an Element subtree
     */
    detachElementCommands(element: HTMLElement = document.body, actions: CommandAction[] = []) {
        actions.forEach(a => this.removeCommand(element, a));
    }

    /**
     * Return the list of registered commands under a given element
     */
    getRegisteredCommands(element: HTMLElement = document.body) {
        return this.getCommandBlocks(element).map(c => c.actions).flat();
    }
}
