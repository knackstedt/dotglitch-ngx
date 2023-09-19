import { Fetch } from '../../public-api';
import { NgxFileManagerConfiguration } from './filemanager.component';

export const uploadFile = (
        fetch: Fetch,
        config: NgxFileManagerConfiguration,
        currentDirectory: string,
        targetPath?: string,
        contextTags: {[key: string]: string} = {}
    ) => new Promise(r => {

    const inEl = document.createElement('input');
    inEl.setAttribute('type', 'file');
    inEl.setAttribute('multiple', '');
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
        formData.append("data", JSON.stringify({
            path: currentDirectory,
            ...contextTags
        }));

        const url = config.apiSettings.uploadEntryUrlTemplate
            ? config.apiSettings.uploadEntryUrlTemplate(targetPath ?? currentDirectory)
            : config.apiSettings.uploadEntryUrl;

        r(fetch.post(url, formData).then(res => {
            inEl.remove();
            return res;
        }));
    });
});

