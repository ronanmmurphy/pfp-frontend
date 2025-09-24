import { AbstractControl, FormGroup, Validators } from '@angular/forms';

export function clearValidators(form: FormGroup, keys: string[]) {
  keys.forEach((key) => form.get(key)?.clearValidators());
}

export function setRequired(form: FormGroup, keys: string[]) {
  keys.forEach((key) => form.get(key)?.setValidators([Validators.required]));
}

export function passwordsMatch(group: AbstractControl) {
  const password = group.get('password')?.value;
  const passwordConfirm = group.get('passwordConfirm')?.value;
  return password && passwordConfirm && password === passwordConfirm ? null : { passwordsMismatch: true };
}

export function updateValidity(form: FormGroup, keys: string[]) {
  keys.forEach((key) => form.get(key)?.updateValueAndValidity());
}

export function isFormInvalid(form: FormGroup, name: string) {
  const c = form.get(name);
  return !!c && c.touched && c.invalid;
}

export function isFormError(form: FormGroup, name: string, key: string) {
  return !!form.get(name)?.hasError(key);
}
