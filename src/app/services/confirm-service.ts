import { Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmDialog, ConfirmOptions } from '../components/confirm-dialog/confirm-dialog';

//  "are you sure?" dialog instead of the browser's confirm().
// The Angular CDK dialog keeps keyboard focus inside it, closes with Escape
// and puts focus back on the button that opened it.
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private dialog: Dialog) {}

  ask(options: ConfirmOptions): Observable<boolean> {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialog, {
      data: options,
      role: 'alertdialog',                  // screen readers announce it straight away
      ariaModal: true,
      ariaLabelledBy: 'confirm-title',
      ariaDescribedBy: 'confirm-message',
      autoFocus: '#confirm-cancel',         // the safe button gets focus first
      width: 'calc(100% - 2rem)',
      maxWidth: '28rem'
    });
    return dialogRef.closed.pipe(map(answer => answer === true));
  }
}
