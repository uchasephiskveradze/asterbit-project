import { ValidationErrors } from '@angular/forms';

export function getPostFormControlError(errors: ValidationErrors | null): string {
  if (!errors) {
    return 'Invalid value.';
  }

  if (errors['required']) {
    return 'This field is required.';
  }

  if (errors['minlength']) {
    const required = errors['minlength'].requiredLength;
    return `Must be at least ${required} characters.`;
  }

  if (errors['maxlength']) {
    const required = errors['maxlength'].requiredLength;
    return `Must be at most ${required} characters.`;
  }

  return 'Invalid value.';
}
