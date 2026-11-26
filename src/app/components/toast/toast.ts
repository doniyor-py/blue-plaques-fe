import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ToastService, ToastAction } from '../../services/toast-service';

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
