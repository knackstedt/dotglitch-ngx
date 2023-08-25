import { PopupOptions } from './popup';

export type TooltipOptions = Partial<PopupOptions & {
    /**
     * Duration in ms for how long the mouse
     * needs to be over the element before the
     * tooltip will be visible
     * Default `250`
     */
    delay: number,

    /**
     * A key the user can press to keep a tooltip visible.
     * Default `F2`
     */
    freezeOnKeyCode: string,
}>;
