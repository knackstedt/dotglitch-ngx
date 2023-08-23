export const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Prompt the user to save a json file of the given object.
 */
export const saveObjectAsFile = (name: string, data: Object) => {
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(data)], { type: "application/json" });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
    a.remove();
};

/**
 * Formatted logger that will print a bit of context before the message.
 * @returns
 */
export const Logger = (context: string, contextColor: string, textColor: string = "#03a9f4") => ({
    log: (message, ...args) => {
        console.log(`%c[${context}] %c${message}`, 'color: ' + contextColor, 'color: ' + textColor, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`%c[${context}] %c${message}`, 'color: ' + contextColor, 'color: ' + textColor, ...args);
    },
    err: (message, ...args) => {
        console.error(`%c[${context}] %c${message}`, 'color: ' + contextColor, 'color: ' + textColor, ...args);
    },
    error: (message, ...args) => {
        console.error(`%c[${context}] %c${message}`, 'color: ' + contextColor, 'color: ' + textColor, ...args);
    }
});

/**
 * Convert a string `fooBAR baz_160054''"1]"` into a slug: `foobar-baz-1600541`
 */
export const stringToSlug = (text: string) =>
    (text || '')
        .trim()
        .toLowerCase()
        .replace(/[\-_+ ]/g, '-')
        .replace(/[^a-z0-9\-]/g, '');

