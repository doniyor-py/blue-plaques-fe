import { FormControl, FormGroup } from '@angular/forms';

import { passwordsMatch } from './passwords-match';

describe('passwordsMatch', () => {
  function makeForm(password: string, confirm: string) {
    return new FormGroup({
      password: new FormControl(password),
      confirm_password: new FormControl(confirm)
    }, { validators: passwordsMatch('password', 'confirm_password') });
  }

  it('is happy when both passwords are the same', () => {
    expect(makeForm('teapot river', 'teapot river').hasError('passwordsDontMatch')).toBeFalse();
  });

  it('reports an error when they are different', () => {
    expect(makeForm('teapot river', 'teapot rivet').hasError('passwordsDontMatch')).toBeTrue();
  });

  it('is case sensitive', () => {
    expect(makeForm('Password1', 'password1').hasError('passwordsDontMatch')).toBeTrue();
  });

  it('checks again when the user types in the second box', () => {
    const form = makeForm('Password1', '');
    expect(form.hasError('passwordsDontMatch')).toBeTrue();
    form.get('confirm_password')!.setValue('Password1');
    expect(form.hasError('passwordsDontMatch')).toBeFalse();
  });
});
