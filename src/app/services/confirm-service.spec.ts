import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';

import { ConfirmService } from './confirm-service';

describe('ConfirmService', () => {
  let service: ConfirmService;
  let answer: boolean | undefined;

  beforeEach(() => {
    service = TestBed.inject(ConfirmService);
    answer = undefined;
    service.ask({ title: 'Delete this photo?', message: 'It will be removed for everyone.', confirmText: 'Delete photo' })
      .subscribe(result => answer = result);
    TestBed.tick();
  });

  afterEach(() => TestBed.inject(Dialog).closeAll());

  function dialog(): HTMLElement {
    return document.querySelector<HTMLElement>('[role="alertdialog"]')!;
  }

  it('shows an alert dialog that screen readers can name and describe', () => {
    expect(dialog().getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog().getAttribute('aria-labelledby')!)!.textContent).toContain('Delete this photo?');
    expect(document.getElementById(dialog().getAttribute('aria-describedby')!)!.textContent).toContain('removed for everyone');
  });

  it('puts focus on Cancel, the safe choice', () => {
    expect(document.activeElement!.id).toBe('confirm-cancel');
  });

  it('answers yes only when the red button is pressed', () => {
    [...dialog().querySelectorAll('button')].find(b => b.textContent!.trim() === 'Delete photo')!.click();
    expect(answer).toBeTrue();
  });

  it('answers no on Cancel', () => {
    dialog().querySelector<HTMLButtonElement>('#confirm-cancel')!.click();
    expect(answer).toBeFalse();
  });

  it('answers no when Escape is pressed', () => {
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
    expect(answer).toBeFalse();
  });
});
