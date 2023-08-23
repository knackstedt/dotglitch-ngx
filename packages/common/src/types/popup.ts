export type PopupOptions = Partial<{
    /**
     * Position relative to the element the menu pops-up at
     */
    position: "top" | "right" | "bottom" | "left",
    /**
     * How the popup is aligned relative to the element
     */
    alignment: "center" | "beforestart" | "start" | "end" | "afterend",
    /**
     * @hidden
     * WIP:
     * Show an error from the dialog pointing to the element
     */
    showArrow: boolean,
    /**
     * @hidden
     * WIP:
     * Size of the arrow.
     */
    arrowSize: number,
    /**
     * How much padding to add near the edges of the screen.
     */
    edgePadding: number,

    customClass: string[];
}>;
