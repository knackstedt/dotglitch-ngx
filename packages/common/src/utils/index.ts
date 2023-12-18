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

class Emoticon {
    constructor (public icon: string){}
}

/**
 * authorization 🔐 \
 * user 🪪 \
 * security 🛡 \
 * system 🖥 \
 * toolbox 🧰 \
 * chore ⚙ \
 * config 🛠 \
 * renderer 📐 \
 * package 📦 \
 * time ⏳ \
 * download 📥 \
 * upload 📤 \
 * bug 🦠 \
 * bomb 💣 \
 * tnt 🧨 \
 * warning ⚠️ \
 * chart 📊 \
 * chart_up 📈 \
 * chart_down 📉 \
 * circle_red 🔴 \
 * circle_orange 🟠 \
 * circle_yellow 🟡 \
 * circle_green 🟢 \
 * circle_blue 🔵 \
 * circle_violet 🟣 \
 * circle_black ⚫️ \
 * circle_white ⚪️ \
 * circle_brown 🟤 \
 * square_red 🟥 \
 * square_orange 🟧 \
 * square_yellow 🟨 \
 * square_green 🟩 \
 * square_blue 🟦 \
 * square_violet 🟪 \
 * square_black ⬛️ \
 * square_white ⬜️ \
 * square_brown 🟫
 */
export const LogIcon = {
    authorization: new Emoticon("🔐"),
    user: new Emoticon("🪪"),
    security: new Emoticon("🛡"),
    system: new Emoticon("🖥"),
    toolbox: new Emoticon("🧰"),
    chore: new Emoticon("⚙"),
    config: new Emoticon("🛠"),
    renderer: new Emoticon("📐"),
    package: new Emoticon("📦"),
    time: new Emoticon("⏳"),
    download: new Emoticon("📥"),
    upload: new Emoticon("📤"),
    bug: new Emoticon("🦠"),
    bomb: new Emoticon("💣"),
    tnt: new Emoticon("🧨"),
    warning: new Emoticon("⚠️"),
    chart: new Emoticon("📊"),
    chart_up: new Emoticon("📈"),
    chart_down: new Emoticon("📉"),

    circle_red: new Emoticon("🔴"),
    circle_orange: new Emoticon("🟠"),
    circle_yellow: new Emoticon("🟡"),
    circle_green: new Emoticon("🟢"),
    circle_blue: new Emoticon("🔵"),
    circle_violet: new Emoticon("🟣"),
    circle_black: new Emoticon("⚫️"),
    circle_white: new Emoticon("⚪️"),
    circle_brown: new Emoticon("🟤"),
    square_red: new Emoticon("🟥"),
    square_orange: new Emoticon("🟧"),
    square_yellow: new Emoticon("🟨"),
    square_green: new Emoticon("🟩"),
    square_blue: new Emoticon("🟦"),
    square_violet: new Emoticon("🟪"),
    square_black: new Emoticon("⬛️"),
    square_white: new Emoticon("⬜️"),
    square_brown: new Emoticon("🟫")
}

class Log {
    constructor(
        private context: string,
        private contextColor: string,
        private textColor: string
    ) { }

    log(icon: Emoticon, message: string, ...args)
    log(message: string, ...args)
    log(iconOrMessage: Emoticon | string, messageText: string, ...args) {
        if (iconOrMessage instanceof Emoticon) {
            console.log(`${iconOrMessage} %c[${this.context}] %c${messageText}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
        else {
            console.log(`%c[${this.context}] %c${iconOrMessage}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
    }

    warn(icon: Emoticon, message: string, ...args)
    warn(message: string, ...args)
    warn(iconOrMessage: Emoticon | string, messageText: string, ...args) {
        if (iconOrMessage instanceof Emoticon) {
            console.warn(`${iconOrMessage} %c[${this.context}] %c${messageText}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
        else {
            console.warn(`%c[${this.context}] %c${iconOrMessage}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
    }

    err(icon: Emoticon, message: string, ...args)
    err(message: string, ...args)
    err(iconOrMessage: Emoticon | string, messageText: string, ...args) {
        if (iconOrMessage instanceof Emoticon) {
            console.error(`${iconOrMessage} %c[${this.context}] %c${messageText}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
        else {
            console.error(`%c[${this.context}] %c${iconOrMessage}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
    }

    error(icon: Emoticon, message: string, ...args)
    error(message: string, ...args)
    error(iconOrMessage: Emoticon | string, messageText: string, ...args) {
        if (iconOrMessage instanceof Emoticon) {
            console.error(`${iconOrMessage} %c[${this.context}] %c${messageText}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
        else {
            console.error(`%c[${this.context}] %c${iconOrMessage}`, 'color: ' + this.contextColor, 'color: ' + this.textColor, ...args);
        }
    }
}

/**
 * Formatted logger that will print a bit of context before the message.
 * @returns
 */
export const ConsoleLogger = (context: string, contextColor: string, textColor: string = "#03a9f4") =>
    new Log(context, contextColor, textColor);

/**
 * Convert a string `fooBAR baz_160054''"1]"` into a slug: `foobar-baz-1600541`
 */
export const stringToSlug = (text: string) =>
    (text || '')
        .trim()
        .toLowerCase()
        .replace(/[\-_+ ]/g, '-')
        .replace(/[^a-z0-9\-]/g, '');


/**
* Helper to update the page URL.
* @param page component page ID to load.
* @param data string or JSON data for query params.
*/
export const updateUrl = (page?: string, data: string | string[][] | Record<string, string | number> | URLSearchParams = {}, replaceState = false) => {
    const [oldHash, qstring] = location.hash.split('?');

    if (!page)
        page = oldHash.split('/')[1];

    const hash = `#/${page}`;

    // Convert the data object to JSON.
    if (data instanceof URLSearchParams) {
        data = [...(data as any).entries()].map(([k, v]) => ({ [k]: v })).reduce((a, b) => ({ ...a, ...b }), {});
    }

    const query = new URLSearchParams(data as any) as any;
    const prevParams = new URLSearchParams(qstring) as any;

    // If the hash is the same, retain params.
    if (hash == oldHash) {
        replaceState = true;
        for (const [key, value] of prevParams.entries())
            if (!query.has(key))
                query.set(key, prevParams.get(key));
    }

    for (const [key, val] of query.entries()) {
        if (
            val == null ||
            val == undefined ||
            val == '' ||
            val == 'null' ||
            Number.isNaN(val) ||
            val == 'NaN'
        )
            query.delete(key);
    }

    if (!(hash.toLowerCase() == "#/frame") || data['id'] == -1)
        query.delete('id');


    const strQuery = query.toString();
    console.log(data, hash, strQuery);
    if (replaceState) {
        window.history.replaceState(data, '', hash + (strQuery ? ('?' + strQuery) : ''));
    }
    else {
        window.history.pushState(data, '', hash + (strQuery ? ('?' + strQuery) : ''));
    }
};

export const getUrlData = (source = window.location.hash) => {
    const [hash, query] = source.split('?');
    let data = new URLSearchParams(query) as any;
    return [...data.entries()].map(([k, v]) => ({ [k]: v })).reduce((a, b) => ({ ...a, ...b }), {});
};
