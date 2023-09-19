import { FSDescriptor } from './filemanager.component';
import textExtensions from './textextensions';
import * as MIT from '../../assets/mat-icons';

// Object.keys(MIT).forEach(k => {
//     console.log(k, MIT[k])
// })

const symIcon = Symbol('icon');

const folderNames = MIT['default'].folderNames;
const fileNames = MIT['default'].fileNames;
const fileExtensions = MIT['default'].fileExtensions;

let folderIconNameList = [];
let fileIconNameList = [];
let fileIconExtensionList = [];

Object.entries(fileNames).forEach(([name, icon]) => {
    fileIconNameList.push({
        val: name,
        iconName: icon
    });
})
Object.entries(fileExtensions).forEach(([name, icon]) => {
    fileIconExtensionList.push({
        val: name,
        iconName: icon
    });
})

Object.entries(folderNames).forEach(([name, icon]) => {
    folderIconNameList.push({
        val: name,
        iconName: icon,
    });
})

// const getMimeType = (name: string) =>
//     (/\.(appimage)$/.test(name) && "compressed") ||
//     (/\.(pot|potx|pps|ppsx|ppt|pptm|pptx)$/.test(name) && "presentation") ||
//     (/\.(odt|rtf|doc|docm|docx|dot|dotm|dotx)$/.test(name) && "richtext") ||
//     (/\.(ods|xls|xlsm|xlsx|xps|xlsx|csv)$/.test(name) && "spreadsheet");


// Limited list of pop-icons that match before mat-icons
// const builtinIcons = [
//     "7z",
//     "apk",
//     "arc",
//     "bz",
//     "deb",
//     "gz",
//     "pdf",
//     "rar",
//     "rpm",
//     "tar",
//     "xar",
//     "xz",
//     "zip"
// ];

export class IconResolver {
    public path: string;

    constructor(assetPath = "/assets/") {
        let path = assetPath.trim();

        // Replace any duplicate slash occurences
        path = path.replace(/\/{2,99}/g, '\/');

        // Trim off trailing slashes
        if (path.endsWith('/'))
            path = path.replace(/\/+$/, '');

        // Ensure it starts with a slash.
        if (!path.startsWith('/'))
            path = '/' + path;

        this.path = path;
    }

    private isText(path: string) {
        const ext = path.split('.').pop();
        return textExtensions.includes(ext);
    }

    private getBestMatch(data: { val: string, iconName: string; }[], filename) {
        return data
            .filter(d => filename.endsWith(d.val)) // filter to all match results
            .sort((a, b) => b.val.length - a.val.length) // sort longest string first
        [0]?.iconName; // Return the first result.
    }

    private resolveDirIcon (file: FSDescriptor) {
        if (!file.name && !file.path)  {
            return {
                path: `${this.path}/material/folder.svg`,
                needsBackdrop: false
            }
        }

        const dirnameMatch = this.getBestMatch(folderIconNameList, file['vanityName'] || file.name || file.path);
        // VS Code Material Icon Theme pack

        // TODO: default to a clear icon that doesn't have decoration
        return {
            path: dirnameMatch ? `${this.path}/material/${dirnameMatch}.svg` : `${this.path}/material/folder.svg`,
            needsBackdrop: false
        };
    }

    private resolveFileIcon (file: FSDescriptor) {
        // Folders always use the material-icon-theme

        // const baseExt = builtinIcons.find(ext => (file['vanityName'] || file.name).endsWith('.' + ext));
        // if (baseExt) {
        //     return {
        //         path: `${this.path}/pop/exts/${baseExt}.svg`,
        //         needsBackdrop: false
        //     };
        // }

        // // Resolve a base MIME type via path extension
        // const base2Ext = getMimeType((file['vanityName'] || file.name));

        // // If we get a path extension, we can easily map the icon
        // if (base2Ext) {
        //     return {
        //         path: `${this.path}/pop/${base2Ext}.svg`,
        //         needsBackdrop: false
        //     };
        // }

        // Lookup a filename from material-icon-theme
        const filename = fileIconNameList
            .filter(d => (file['vanityName'] || file.name).toLowerCase() == d.val.toLowerCase())
            .sort((a, b) => b.val.length - a.val.length)
            [0]?.iconName;

        if (filename) {
            return {
                path: `${this.path}/material/${filename}.svg`,
                needsBackdrop: true
            };
        }

        // foo.log.1 foo.log.123 should be treated clearly as log files.
        if (/\.log\.\d+$/.test(filename)) {
            return {
                path: `${this.path}/material/log.svg`,
                needsBackdrop: true
            };
        }

        // Check the file's extension -- we may
        const fileext = fileIconExtensionList
            .filter(d => (file['vanityName'] || file.name).toLowerCase().endsWith('.' + d.val.toLowerCase()))
            .sort((a, b) => b.val.length - a.val.length)
            [0]?.iconName;

        if (fileext) return {
            path: `${this.path}/material/${fileext}.svg`,
            needsBackdrop: true
        };

        // If the file doesn't have a text extension, we're going to assume it's binary data.
        const isFileBinary = !this.isText(file.path);


        return {
            path: isFileBinary ? `${this.path}/material/document.svg` : `${this.path}/material/assembly.svg`,
            // path: isFileBinary ? `${this.path}/pop/text.svg` : `${this.path}/pop/binary.svg`,
            needsBackdrop: false
        };
    }

    // TODO: resolve dynamic thumbnails for media documents
    resolveIcon(file: FSDescriptor): { path: string, needsBackdrop: boolean; } {
        if (!file) return null;
        if (file[symIcon]) return file[symIcon];

        if (file.kind == "directory") {
            return file[symIcon] = this.resolveDirIcon(file);
        }

        return file[symIcon] = this.resolveFileIcon(file);
    };
}
