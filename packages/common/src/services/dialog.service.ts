import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Logger } from '../utils';
import { LazyLoaderService } from '../public-api';

const { log, warn, err } = Logger("DialogService", "#607d8b");

export type DialogOptions = Partial<Omit<MatDialogConfig<any>, 'data'> & {
    /**
     * List of properties to be provided to @Input() injectors
     */
    inputs: { [key: string]: any },
    /**
     * List of properties to be provided to @Input() injectors
     */
    outputs: { [key: string]: Function },
    /**
     * Context in which to execute callbacks from the `outputs` property via
     * @Output() event Emitters
     */
    parent: any
}>;

@Injectable({
    providedIn: 'root'
})
export class DialogService {

    private dialogs: MatDialogRef<unknown, any>[] = [];

    constructor(
        private dialog: MatDialog,
        private lazyLoader: LazyLoaderService
    ) {
    }

    open(name: string)
    open(name: string, opts: DialogOptions)
    open(name: string, group: string)
    open(name: string, group: string, opts: DialogOptions)
    open(name: string, groupOrOptions?: any, opts: DialogOptions = {}): Promise<any> {
        const group = typeof groupOrOptions == "string" ? groupOrOptions : 'default';
        if (typeof groupOrOptions == 'object')
            opts = groupOrOptions;

        return new Promise((resolve, reject) => {

            const registration = this.lazyLoader.resolveRegistrationEntry(name, group);
            if (!registration)
                return reject(new Error("Cannot open dialog for " + name + ". Could not find in registry."));


            const args = {
                closeOnNavigation: true,
                restoreFocus: true,
                width: registration['width'],
                height: registration['height'],
                ...opts,
                data: {
                    id: name,
                    inputs: opts.inputs || {},
                    outputs: opts.outputs || {},
                    group: group
                },
                panelClass: [
                    "dialog-" + name,
                    ...(Array.isArray(opts.panelClass) ? opts.panelClass : [opts.panelClass] || [])
                ]
            };

            // TODO:
            let dialog = this.dialog.open(undefined, args);

            dialog['idx'] = name;
            this.dialogs.push(dialog);

            dialog.afterClosed().subscribe(result => {
                log("Dialog closed " + name, result);
                resolve(result);
            });
        });
    }

    // Close all dialogs matching the given name
    close(name: string) {
        const dialogs = this.dialogs.filter(d => d['idx'] == name);
        dialogs.forEach(dialog => dialog.close());
    }

    /**
     * Method to close _all_ dialogs.
     * Should be used sparingly.
     */
    clearDialog() {
        this.dialogs.forEach(dialog => dialog.close());
    }

    /**
     * Open a confirmation dialog. Will reject if a cancel occurs.
     * @param title title of the dialog
     * @param message main question that a user needs to confirm/deny
     * @returns
     */
    // confirmAction(title: string, message: string): Promise<void> {
    //     return new Promise((res, rej) => {
    //         const dialog = this.dialog.open(ConfirmationComponent, {
    //             maxHeight: "90vh",
    //             maxWidth: "90vw",
    //             panelClass: ["dialog-confirmation"],
    //             closeOnNavigation: true,
    //             restoreFocus: true,
    //             data: {title, message}
    //         });

    //         dialog.afterClosed().subscribe(result => {
    //             result == true ? res() : rej();
    //         });
    //     });
    // }
}
