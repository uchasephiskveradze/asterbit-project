import { ValidationErrors } from '@angular/forms';

export type PostFormControlError = {
  key: string;
  params?: Record<string, number>;
};

export function getPostFormControlError(errors: ValidationErrors | null): PostFormControlError | null {
  if (!errors) {
    return null;
  }

  if (errors['required']) {
    return { key: 'form.errors.required' };
  }

  if (errors['minlength']) {
    return {
      key: 'form.errors.minLength',
      params: { count: errors['minlength'].requiredLength },
    };
  }

  if (errors['maxlength']) {
    return {
      key: 'form.errors.maxLength',
      params: { count: errors['maxlength'].requiredLength },
    };
  }

  return { key: 'form.errors.invalid' };
}
