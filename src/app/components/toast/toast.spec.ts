import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Toast } from './toast';
import { ToastService } from '../../services/toast-service';

describe('Toast', () => {
  let fixture: ComponentFixture<Toast>;
  let toasts: ToastService;

  beforeEach(() => {
    fixture = TestBed.createComponent(Toast);
    toasts = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  function page(): HTMLElement {
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('announces the message politely and hides it after 5 seconds', fakeAsync(() => {
    expect(page().querySelector('[aria-live="polite"]')).toBeTruthy();
    toasts.show({ text: 'Saved to your favourites' });
    expect(page().textContent).toContain('Saved to your favourites');
    tick(4999);
    expect(page().querySelector('.app-toast')).toBeTruthy();
    tick(1);
    expect(page().querySelector('.app-toast')).toBeNull();
  }));

  it('stays while the pointer is on it, and closes with its button', fakeAsync(() => {
    toasts.show({ text: 'Photo uploaded' });
    page().querySelector('.app-toast')!.dispatchEvent(new Event('mouseenter'));
    tick(10000);
    expect(page().querySelector('.app-toast')).toBeTruthy();
    page().querySelector<HTMLButtonElement>('[aria-label="Close message"]')!.click();
    expect(page().querySelector('.app-toast')).toBeNull();
  }));

  it('runs an action and closes, without moving focus', fakeAsync(() => {
    const before = document.activeElement;
    const rate = jasmine.createSpy('rate');
    toasts.show({ text: 'Visit saved:', actions: [{ label: 'rate it', run: rate }, { label: 'add a photo', run: jasmine.createSpy('photo') }] });
    expect(document.activeElement).toBe(before);
    expect(page().textContent).toContain('rate it or add a photo');
    page().querySelector<HTMLButtonElement>('.toast-link')!.click();
    expect(rate).toHaveBeenCalled();
    expect(page().querySelector('.app-toast')).toBeNull();
    tick(5000);
  }));
});
