import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Post } from '../../models/post.model';
import { PostFormControls, PostFormValue } from './types/post-form.types';
import { POST_FORM_VALIDATION } from './post-form.validation';

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss',
})
export class PostFormComponent {
  public readonly post = input<Post | null>(null);
  public readonly submitting = input(false);
  public readonly submitLabel = input('Save Post');

  public readonly formSubmit = output<PostFormValue>();

  public readonly validation = POST_FORM_VALIDATION;

  private readonly focusedField = signal<keyof PostFormValue | null>(null);

  private readonly fb = inject(FormBuilder);

  public readonly form = this.fb.group<PostFormControls>({
    title: this.fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(POST_FORM_VALIDATION.title.minLength),
        Validators.maxLength(POST_FORM_VALIDATION.title.maxLength),
      ],
    }),
    author: this.fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(POST_FORM_VALIDATION.author.maxLength),
      ],
    }),
    description: this.fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(POST_FORM_VALIDATION.description.minLength),
        Validators.maxLength(POST_FORM_VALIDATION.description.maxLength),
      ],
    }),
    content: this.fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(POST_FORM_VALIDATION.content.minLength),
        Validators.maxLength(POST_FORM_VALIDATION.content.maxLength),
      ],
    }),
  });

  public constructor() {
    effect(() => {
      const value = this.post();
      if (value) {
        this.form.patchValue({
          title: value.title,
          author: value.author,
          description: value.description,
          content: value.content,
        });
      }
    });
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }

  public getLength(controlName: keyof PostFormValue): number {
    return this.form.controls[controlName].value.length;
  }

  public showCounter(controlName: keyof PostFormValue): boolean {
    return this.focusedField() === controlName;
  }

  public onFieldFocus(controlName: keyof PostFormValue): void {
    this.focusedField.set(controlName);
  }

  public onFieldBlur(controlName: keyof PostFormValue): void {
    if (this.focusedField() === controlName) {
      this.focusedField.set(null);
    }
  }

  public isInvalid(controlName: keyof PostFormValue): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  public isBelowMinLength(controlName: keyof PostFormValue): boolean {
    const rules = POST_FORM_VALIDATION[controlName];
    if (!('minLength' in rules)) {
      return false;
    }

    return this.getLength(controlName) < rules.minLength;
  }

  public getError(controlName: keyof PostFormValue): string {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('minlength')) {
      const required = control.getError('minlength').requiredLength;
      return `Must be at least ${required} characters.`;
    }

    if (control.hasError('maxlength')) {
      const required = control.getError('maxlength').requiredLength;
      return `Must be at most ${required} characters.`;
    }

    return 'Invalid value.';
  }
}
