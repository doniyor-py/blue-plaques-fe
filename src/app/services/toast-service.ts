import { Injectable, signal } from '@angular/core';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  text: string;
  actions?: ToastAction[];
}

const SHOW_FOR = 5000;      // 5 seconds, paused while the pointer or focus is on the toast

// One short message after an action, e.g. "Saved to your favourites"
@Injectable({ providedIn: 'root' })
export class ToastService {
  current = signal<Toast | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  show(toast: Toast) {
    this.current.set(toast);
    this.resume();
  }

  hide() {
    this.pause();
    this.current.set(null);
  }

  pause() {
    clearTimeout(this.timer);
  }

  resume() {
    this.pause();
    this.timer = setTimeout(() => this.current.set(null), SHOW_FOR);
  }
}
