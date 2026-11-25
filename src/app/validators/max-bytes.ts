import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function maxBytes(limit: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const size = new TextEncoder().encode(control.value || '').length;
    return size > limit ? { maxBytes: { limit, actual: size } } : null;
  };
}
