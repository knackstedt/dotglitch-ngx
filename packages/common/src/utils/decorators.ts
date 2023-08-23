const key_prefix = "";

const browserStorage = (store: Storage, prototype, propName: string, key?: string, defaultValue: any = null) => {
    const rawKey: string = key_prefix + (key || propName);

    Object.defineProperty(prototype, propName, {
        get: function () {
            let item;
            try {
                item = JSON.parse(store.getItem(rawKey) || 'null');
            } catch (ex) { }

            return item == undefined ? defaultValue : item;
        },
        set: function (value) {
            try {
                store.setItem(rawKey, JSON.stringify(value));
            }
            catch (ex) { }
        }
    });
};

/**
 *
 */
export function LocalStorage(key?: string, defaultValue?: any) {
    return function (prototype, propName) {
        browserStorage(localStorage, prototype, propName, key, defaultValue);
    };
}

/**
 *
 */
export function SessionStorage(key?: string, defaultValue?: any) {
    return function (prototype, propName) {
        browserStorage(sessionStorage, prototype, propName, key, defaultValue);
    };
}

/**
 *
 * @param key
 * @param defaultValue
 * @returns
 */
// export function RemoteStorage(key?: string, defaultValue?: any) {
//     return function (prototype, propName) {
//         const rawKey: string = key || propName;

//         Object.defineProperty(prototype, propName, {
//             get: function () {
//                 let value: any;
//                 return value === undefined ? defaultValue : value;
//             },
//             set: function (value) {
//             }
//         });
//     };
// }

/**
 *
 * Stores a value in the URL query parameter. This is scoped for Angular Components and Services.
 * Will clear the query parameter when the component or service destroys
 *
 * __If your component isn't reading the value, remove your default setter__
 *
 * ```ts
 *   // From:
 *   @UriStorage() mode: string = 'view';
 *   // To:
 *   @UriStorage("mode", 'view') mode: string;
 * ```
 */
// export const UriStorage = function (key?: string, defaultValue?: string | number | boolean) {
//     return function (prototype, propName) {
//         const k = key || propName;

//         const onDestroy = prototype.ngOnDestroy || (() => { });
//         const onInit = prototype.ngOnInit || (() => { });
//         let isActive = false;
//         let val: any;

//         {
//             let pars = (new URLSearchParams(location.hash.split('?').pop()));
//             val = pars.get(k);
//         }

//         console.log(k, val);

//         Object.defineProperty(prototype, propName, {
//             get: function () {
//                 return val == undefined ? defaultValue : val;
//             },
//             set: function (value) {
//                 val = value;
//                 if (!isActive) return;
//                 try {
//                     let pars = (new URLSearchParams(location.hash.split('?').pop()));
//                     pars.set(k, value);
//                     updateUrl(null, pars, true);
//                 }
//                 catch (ex) { console.log("FOO", ex); }
//             }
//         });

//         Object.defineProperty(prototype, 'ngOnDestroy', {
//             value: function () {
//                 let pars = (new URLSearchParams(location.hash.split('?').pop()));
//                 pars.delete(k);
//                 updateUrl(null, pars, true);
//                 onDestroy.call(this);
//             }
//         });

//         Object.defineProperty(prototype, 'ngOnInit', {
//             value: function () {
//                 isActive = true;
//                 onInit.call(this);
//             }
//         });
//     };
// };
