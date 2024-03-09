import { HttpClient, HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, isDevMode } from '@angular/core';
import { retry } from 'rxjs/operators';
import { of } from 'rxjs';

// Total number of _retries_ if there is a 429 response code.
const retryCount = 2;

export type FetchOptions = {
    headers?: HttpHeaders | {
        [header: string]: string | string[];
    };
    context?: HttpContext;
    params?: HttpParams | {
        [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    };
    body?: any,
    observe?: 'body' | 'events' | 'response';
    reportProgress?: boolean;
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    withCredentials?: boolean;
}

@Injectable({
    providedIn: "root"
})
export class Fetch {
    constructor(
        private http: HttpClient
    ) { }

    // Public interface for making AJAX transactions
    public get<T>(url: string, options: FetchOptions = {}, returnError = false): Promise<T> {
        return this.request<T>("get", url, options, returnError);
    }
    public put<T>(url: string, body: any, options: FetchOptions = {}, returnError = false): Promise<T> {
        options.body = (options.body && Object.keys(options.body).length > 0 ? options.body : body) || {};
        return this.request<T>("put", url, options, returnError);
    }
    public post<T>(url: string, body: any, options: FetchOptions = {}, returnError = false): Promise<T> {
        options.body = (options.body && Object.keys(options.body).length > 0 ? options.body : body) || {};
        return this.request<T>("post", url, options, returnError);
    }
    public patch<T>(url: string, body: any, options: FetchOptions = {}, returnError = false): Promise<T> {
        options.body = (options.body && Object.keys(options.body).length > 0 ? options.body : body) || {};
        return this.request<T>("patch", url, options, returnError);
    }
    public delete<T>(url: string, options: FetchOptions = {}, returnError = false): Promise<T> {
        return this.request<T>("delete", url, options, returnError);
    }

    // Internally, handle the observable as a promise.
    private request<T>(method: string, url: string, options: FetchOptions = {}, returnError = false): Promise<T> {
        options.reportProgress = true;

        // Allow support for different response types.
        // Generally we shouldn't need this to be anything other than JSON.
        options.responseType = options.responseType || "json";
        options.withCredentials = true;


        let abort = false;
        const p = new Promise((resolve, reject) => {
            const o = this.http.request(method, url, options)
                .pipe(retry({
                    delay(error, retryCount) {
                        // 429 and 502 are most common for overloaded
                        // backends -- so we'll retry if we get these errors
                        if (error.status == 429 || error.status == 502)
                            return of({});

                        if (error.status == 504 && isDevMode())
                            alert("It looks like you can't reach your development backend anymore");

                        abort = true;

                        reject(error);
                        throw error;
                    },
                    count: retryCount
                }))
                .subscribe(data => {
                    resolve(data as unknown as T);

                    // provide 3ms slacktime before releasing observable.
                    setTimeout(() => {
                        o.unsubscribe();
                    }, 3);
                });
        });

        return p as Promise<T>;
    }
}
