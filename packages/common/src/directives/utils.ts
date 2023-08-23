/**
 * This utils file exists outside of the strict angular DI zone
 * This enables opening popups without requiring absolute DI bindings.
 */

export const getPosition = (el: HTMLElement | PointerEvent, config: any = {}, bounds: DOMRect) => {
    // Bounds of the popup owner
    const src: DOMRect = !!el['nodeName']
                ? (el as HTMLElement).getBoundingClientRect()
                : {
                    // It's a pointer event, so we'll take the X and Y from the pointer.
                    x: el['clientX'],
                    y: el['clientY'],
                    // Set a default tiny size, so we don't divide by zero.
                    width: 0.0001,
                    height: 0.0001
                } as DOMRect;

    // Popup bounds
    const { width, height } = bounds;

    const winh = window.innerHeight;
    const winw = window.innerWidth;

    const cords = {
        top: null,
        left: null
    };

    if (config?.position == "left" || config?.position == "right" || !config?.position) {
        switch (config?.alignment) {

            case "end": {
                // vertically bind to bottom
                cords.top = src.y + src.height - height;
                break;
            }
            case "afterend": {
                // vertically bind below bottom
                cords.top = src.y + src.height;
                break;
            }
            case "beforestart": {
                // vertically bind above top
                cords.top = src.y - height;
                break;
            }
            case "start": {
                // vertically bind to top
                cords.top = src.y;
                break;
            }
            case "center":
            default: {
                // vertically center
                cords.top = (src.y + (src.height / 2)) - (height / 2);
                break;
            }
        }

        // Apply bounds to prevent the dialog from being cut-off screen
        // Lower bound
        cords.top = Math.max(config?.edgePadding || 0, cords.top);
        // Upper bound
        cords.top = Math.min(winh - height, cords.top);

        if (config?.position == "left") {
            cords.left = src.x - (width + (config?.arrowSize || 0) + (config?.arrowPadding || 0));
        }
        if (config?.position == "right" || !config?.position) {
            cords.left = src.x + (src.width + (config?.arrowSize || 0) + (config?.arrowPadding || 0));
        }

        // Lower bound
        cords.left = Math.max(config?.edgePadding || 0, cords.left);
        // Upper bound
        cords.left = Math.min(winw - width, cords.left);
    }
    else if (config?.position == "top" || config?.position == "bottom") {
        switch (config?.alignment) {
            case "end": {
                // vertically bind to right
                cords.left = src.x + src.width - width;
                break;
            }
            case "afterend": {
                // vertically bind past right
                cords.left = src.x + src.width;
                break;
            }
            case "beforestart": {
                // vertically bind before left
                cords.left = src.x - width;
                break;
            }
            case "start": {
                // vertically bind to left
                cords.left = src.x;
                break;
            }
            case "center":
            default: {
                // vertically center
                cords.left = (src.x + (src.width / 2)) - (width / 2);
                break;
            }
        }

        // Apply bounds to prevent the dialog from being cut-off screen
        // Lower bound
        cords.left = Math.max(config?.edgePadding || 0, cords.left);
        // Upper bound
        cords.left = Math.min(winw - width, cords.left);


        if (config?.position == "top") {
            cords.top = src.y - (height + (config?.arrowSize || 0) + (config?.arrowPadding || 0));
        }
        if (config?.position == "bottom") {
            cords.top = src.y + (src.height + (config?.arrowSize || 0) + (config?.arrowPadding || 0));
        }

        // Lower bound
        cords.top = Math.max(config?.edgePadding || 0, cords.top);
        // Upper bound
        cords.top = Math.min(winh - height, cords.top);
    }

    // Assign unit
    cords.top = cords.top + 'px';
    cords.left = cords.left + 'px';

    return cords;
}
