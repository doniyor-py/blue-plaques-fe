import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  constructor(@Inject(DIALOG_DATA) public data: ConfirmOptions,
              public dialogRef: DialogRef<boolean>) {}
}
