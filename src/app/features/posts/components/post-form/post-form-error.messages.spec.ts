import { ValidationErrors } from '@angular/forms';

import { getPostFormControlError } from './post-form-error.messages';

describe('getPostFormControlError', () => {
  it('should return required message key', () => {
    expect(getPostFormControlError({ required: true })).toEqual({
      key: 'form.errors.required',
    });
  });

  it('should return minlength message key', () => {
    const errors: ValidationErrors = {
      minlength: { requiredLength: 10, actualLength: 3 },
    };

    expect(getPostFormControlError(errors)).toEqual({
      key: 'form.errors.minLength',
      params: { count: 10 },
    });
  });
});
