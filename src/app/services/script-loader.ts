import { Injectable } from '@angular/core';

export const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client';
export const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Adds a third-party <script> only when a page needs it, and only once.
// Google and Cloudflare scripts then load (and set their cookies) on Log in / Sign up only.
@Injectable({ providedIn: 'root' })
export class ScriptLoader {
  private scripts = new Map<string, Promise<void>>();

  load(src: string): Promise<void> {
    if (!this.scripts.has(src)) {
      const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          this.scripts.delete(src);     // try later
          script.remove();
          reject(new Error('Could not load ' + src));
        };
        document.head.appendChild(script);
      });
      this.scripts.set(src, promise);
    }
    return this.scripts.get(src)!;
  }
}
