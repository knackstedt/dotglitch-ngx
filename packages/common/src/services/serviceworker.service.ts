// import { Injectable } from '@angular/core';

// import { MatSnackBar } from '@angular/material/snack-bar';
// import { SwUpdate } from '@angular/service-worker';

// /**
//  * This service handles performing service worker upgrades.
//  */
// @Injectable({
//     providedIn: 'root'
// })
// export class ServiceWorkerService {
//     constructor(private swUpdate: SwUpdate, private snackbar: MatSnackBar) {
//         this.swUpdate.versionUpdates.subscribe((evt) => {
//             // Catch installation errors that are not hash mismatches
//             if (evt.type == "VERSION_INSTALLATION_FAILED" && !evt.error.includes("Hash mismatch")) {
//                 console.error(evt);
//             }

//             // If the new version is ready for reload
//             if (evt.type == "VERSION_READY") {
//                 const snack = this.snackbar.open('Update Available', 'Reload');

//                 snack
//                     .onAction()
//                     .subscribe(() => {
//                         window.location.reload();
//                     });

//                 setTimeout(() => {
//                     snack.dismiss();
//                 }, 6000);
//             }
//         });

//         if (this.swUpdate.isEnabled)
//             this.swUpdate.checkForUpdate();
//     }
// }
