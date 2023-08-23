import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import { sleep } from '../utils';

const SCRIPT_INIT_TIMEOUT = 500; // ms

/**
 * Service that installs CSS/JS dynamically
 */
@Injectable({
    providedIn: 'root'
})
export class DependencyService {

    constructor(
        @Inject(DOCUMENT) private document: Document
    ) { }

    /**
     * Install a Javascript file into the webpage on-demand
     * @param id Unique identifier for the JS script
     * @param src URL of the script
     * @param globalkey A global object the script will provide.
     *  Providing this will ensure a promise only resolves after the
     *  specified global object is provided, with a timeout of 500ms
     */
    loadScript(id: string, src: string, globalkey: string = null): Promise<void> {
        return new Promise((res, rej) => {
            if (this.document.getElementById(id)) return res();

            const script = this.document.createElement('script');
            script.id = id;

            script.setAttribute("async", '');
            script.setAttribute("src", src);

            script.onload = async () => {
                if (typeof globalkey == "string") {
                    let i = 0;

                    for (; !window[globalkey] && i < SCRIPT_INIT_TIMEOUT; i += 10)
                        await sleep(10);

                    if (i >= SCRIPT_INIT_TIMEOUT) {
                        return rej(new Error("Timed out waiting for script to self-initialize."));
                    }
                }

                res();
            }

            this.document.body.appendChild(script);
        })
    }

    // loadStylesheet(id: string, href: string) {
    //     let themeLink = this.document.getElementById(id) as HTMLLinkElement;
    //     if (themeLink) {
    //         themeLink.href = href;
    //     }
    //     else {
    //         const style = this.document.createElement('link');
    //         style.id = id;
    //         style.rel = 'stylesheet';
    //         style.href = href;

    //         const head = this.document.getElementsByTagName('head')[0];

    //         head.appendChild(style);
    //     }
    // }
}
