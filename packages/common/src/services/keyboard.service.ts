import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs';

export type KeyCommand = {
    /**
     * The non-modifier key(s) that must be pressed for the event to fire.
     */
    key: string | string[],
    label: string,

    ctrl?: boolean,
    alt?: boolean,
    shift?: boolean,
    super?: boolean,
    tab?: boolean,

    /**
     * Should the handler interrupt default event handling
     */
    interrupt?: boolean,
}

/**
 * Service that listens for global keyboard events
 */
@Injectable({
    providedIn: 'root'
})
export class KeyboardService {

    private heldKeys: { [key: string]: boolean } = {};
    public keyCommands: {
        ctrl?: boolean,
        alt?: boolean,
        shift?: boolean,
        super?: boolean,
        interrupt?: boolean,
        label: string,
        keys: string[],
        sub: Subject<KeyboardEvent>
    }[] = [];

    constructor() {
        window.addEventListener("keydown", (evt) => this.onKeyDown(evt));
        window.addEventListener("keyup", (evt) => this.onKeyUp(evt));
    }

    private onKeyDown(evt: KeyboardEvent) {
        // console.log("keydown", evt.key)
        this.heldKeys[evt.key.toLowerCase()] = true;

        // Do a general filter where all of the modifiers must be matched if specified
        // Then check that the actual keys match what was specified
        let commands = this.keyCommands
            .filter(kc =>
                (kc.ctrl == undefined || kc.ctrl === evt.ctrlKey) &&
                (kc.alt == undefined || kc.alt === evt.altKey) &&
                (kc.shift == undefined || kc.shift === evt.shiftKey) &&
                (kc.super == undefined || kc.super === evt.metaKey) &&
                kc.keys.length == kc.keys.filter(k => this.heldKeys[k])?.length
            );

        if (evt.ctrlKey && commands.length > 0 || commands.find(c => c.interrupt)) {
            evt.stopPropagation();
            evt.preventDefault();
        }

        if (evt.key == "Pause")
            debugger;

        commands.forEach(kc => kc.sub.next(evt));

        /**
         * Prevent CTRL+P and other standard key events from being handled by the browser.
         * Allow specific combonations:
         * CTRL+W
         * CTRL+T
         * CTRL+F5
         */
        // if (evt.ctrlKey && !['w', 't', 'F5'].includes(evt.key)) {
        //     evt.preventDefault();
        // }
    }

    private onKeyUp(evt: KeyboardEvent) {
        this.heldKeys[evt.key.toLowerCase()] = false;
    }

    private onKeyPress(evt: KeyboardEvent) {
        // this.heldKeys[evt.key] = false;
    }

    /**
     * Use this to subscribe to keyboard events throughout
     * the application. This is a passive listener and will
     * **NOT** interrupt the event chain.
     */
    public onKeyCommand(key: KeyCommand) {
        const sub = new Subject<KeyboardEvent>();
        let item = {
            ...key,
            keys: (Array.isArray(key.key) ? key.key : [key.key]),
            sub: sub
        }

        this.keyCommands.push(item);

        return {
            ...sub,
            subscribe: ((...args) => {
                const s = sub.subscribe(...args);
                return {
                    ...s,
                    unsubscribe: () => {
                        s.unsubscribe();

                        // Remove the keycommand from the list of listeners.
                        const i = this.keyCommands.findIndex(c => c == item);
                        this.keyCommands.splice(i, 1);
                    }
                };
            }) as Subject<KeyboardEvent>['subscribe']
        };
    }

    /**
     * Return `true` if shift is currently pressed.
     */
    get isShiftPressed() {
        return !!this.heldKeys["shift"];
    }
    /**
     * Return `true` if ctrl is currently pressed.
     */
    get isCtrlPressed() {
        return !!this.heldKeys["control"];
    }
    /**
     * Return `true` if alt is currently pressed.
     */
    get isAltPressed() {
        return !!this.heldKeys["alt"];
    }
    /**
     * Return `true` if super (mac/linux) or the windows key is currently pressed.
     */
    get isSuperPressed() {
        return !!this.heldKeys["super"];
    }
    /**
     * Return `true` if tab is currently pressed.
     */
    get isTabPressed() {
        return !!this.heldKeys["tab"];
    }

    @HostListener("window:blur")
    @HostListener("window:resize")
    clearKeys() {
        Object.keys(this.heldKeys).forEach(k => {
            this.heldKeys[k] = false;
        });
    }
}
