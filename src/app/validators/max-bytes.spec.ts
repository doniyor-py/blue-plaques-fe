import { FormControl } from '@angular/forms';

import { maxBytes } from './max-bytes';

describe('maxBytes', () => {
  const check = (value: string) => new FormControl(value, maxBytes(72));

  it('allows 72 Latin letters (1 byte each)', () => {
    expect(check('a'.repeat(72)).hasError('maxBytes')).toBeFalse();
  });

  it('rejects 73 Latin letters', () => {
    expect(check('a'.repeat(73)).hasError('maxBytes')).toBeTrue();
  });

  it('counts Cyrillic letters as 2 bytes, so 40 of them are too long', () => {
    const control = check('п'.repeat(40));
    expect(control.hasError('maxBytes')).toBeTrue();
    expect(control.getError('maxBytes').actual).toBe(80);
  });

  it('is happy with an empty box (the required check deals with that)', () => {
    expect(check('').hasError('maxBytes')).toBeFalse();
  });
});
