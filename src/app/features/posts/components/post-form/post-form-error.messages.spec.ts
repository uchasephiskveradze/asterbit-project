import { ValidationErrors } from '@angular/forms';

import { getPostFormControlError } from './post-form-error.messages';

describe('getPostFormControlError', () => {
  it('should return required message', () => {
    expect(getPostFormControlError({ required: true })).toBe('This field is required.');
  });

  it('should return minlength message', () => {
    const errors: ValidationErrors = {
      minlength: { requiredLength: 10, actualLength: 3 },
    };

    expect(getPostFormControlError(errors)).toBe('Must be at least 10 characters.');
  });

  it('should return maxlength message', () => {
    const errors: ValidationErrors = {
      maxlength: { requiredLength: 120, actualLength: 150 },
    };

    expect(getPostFormControlError(errors)).toBe('Must be at most 120 characters.');
  });
});
