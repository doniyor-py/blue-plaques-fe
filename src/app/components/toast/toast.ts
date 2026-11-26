import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ToastService, ToastAction } from '../../services/toast-service';

// Shown once in the app shell. The live region is always there, so screen readers
// hear each new message; focus never moves to it.
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class Toast {
  constructor(public toastService: ToastService) {}

  runAction(action: ToastAction) {
    this.toastService.hide();
    action.run();
  }
}
