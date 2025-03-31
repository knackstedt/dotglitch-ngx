import { PopupOptions } from './popup';

export type TooltipOptions = Partial<PopupOptions & {
    /**
     * Duration in ms for how long the mouse
     * needs to be over the element before the
     * tooltip will be visible
     *  - Default `250`
     *  - Only applies when trigger is `hover`.
     */
    delay: number,

    /**
     * A key the user can press to keep a tooltip visible.
     *  - Default `F2`
     */
    freezeOnKeyCode: string,

    /**
     * What user interaction event should make the tooltip appear.
     *  - Default `hover`
     */
    triggers: ("click" | "hover")[],

    /**
     * Set to `true` to keep the tooltip open when hovered over.
     * Primarily used for popping up interactive components
     */
    stayOpen: boolean,

    /**
     * Configurable border radius
     */
    borderRadius: number,
}>;
