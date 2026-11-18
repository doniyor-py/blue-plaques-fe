import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// a form-group validator: the two fields must have the same value
export function passwordsMatch(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(field)?.value;
    const confirm = group.get(confirmField)?.value;
    return value === confirm ? null : { passwordsDontMatch: true };
  };
}
