import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmOptions {
  title: string;          // "Delete this photo?"
  message: string;        // what will happen
  confirmText: string;    // the red button, e.g. "Delete photo"
}

// The pop-up that asks "are you sure?" before deleting something.
// Opened by ConfirmService; answers true (yes) or false (cancel).
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  constructor(@Inject(DIALOG_DATA) public data: ConfirmOptions,
              public dialogRef: DialogRef<boolean>) {}
}
