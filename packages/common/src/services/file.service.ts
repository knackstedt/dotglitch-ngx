import { Injectable } from '@angular/core';
import { Fetch } from './fetch.service';


/**
 * Service that listens for global keyboard events
 */
@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor(private fetch: Fetch) { }

    chooseFile = (accept?: string, multiple = false, formMetadata = {}, ) => {
        return new Promise(r => {
            const inEl = document.createElement('input');
            inEl.setAttribute('type', 'file');
            if (multiple)
                inEl.setAttribute('multiple', '');
            if (accept)
                inEl.setAttribute('accept', accept);

            inEl.click();

            let formData = new FormData();

            inEl.addEventListener('change', () => {
                Object.keys(inEl.files).forEach(k => {
                    const file: {
                        lastModified: number,
                        lastModifiedDate: Date,
                        name: string,
                        size: number,
                        type: string;
                    } = inEl.files[k];

                    const name = file.name;
                    formData.append(name, file as any);
                });
                formData.append("data", JSON.stringify(formMetadata));
                inEl.remove();
                r(formData);
            });
        });
    };

    // uploadFile = (config: NgxFileManagerConfiguration, currentDirectory: string, targetPath?: string) => {
    //     return new Promise(r => {
    //         const inEl = document.createElement('input');
    //         inEl.setAttribute('type', 'file');
    //         inEl.setAttribute('multiple', '');
    //         inEl.click();

    //         let formData = new FormData();

    //         inEl.addEventListener('change', () => {
    //             Object.keys(inEl.files).forEach(k => {
    //                 const file: {
    //                     lastModified: number,
    //                     lastModifiedDate: Date,
    //                     name: string,
    //                     size: number,
    //                     type: string;
    //                 } = inEl.files[k];

    //                 const name = file.name;
    //                 formData.append(name, file as any);
    //             });
    //             formData.append("data", JSON.stringify({
    //                 path: currentDirectory
    //             }));

    //             const url = config.apiSettings.uploadEntryUrlTemplate
    //                 ? config.apiSettings.uploadEntryUrlTemplate(targetPath ?? currentDirectory)
    //                 : config.apiSettings.uploadEntryUrl;

    //             r(this.fetch.post(url, formData).then(res => {
    //                 inEl.remove();
    //                 return res;
    //             }));
    //         });
    //     });
    // };
}
