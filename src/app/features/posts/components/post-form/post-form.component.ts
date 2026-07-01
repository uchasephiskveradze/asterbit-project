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
import { TranslatePipe } from '@ngx-translate/core';

import { Post } from '../../models/post.model';
import { getPostFormControlError, PostFormControlError } from './post-form-error.messages';
import { PostFormControls, PostFormValue } from './types/post-form.types';
import { POST_FORM_VALIDATION } from './post-form.validation';

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss',
})
export class PostFormComponent {
  public readonly post = input<Post | null>(null);
  public readonly hideAuthor = input(false);
  public readonly authorDisplayName = input('');
  public readonly submitting = input(false);
  public readonly submitLabel = input('form.post.savePost');

  public readonly formSubmit = output<PostFormValue>();
  public readonly cancelClick = output<void>();

  public readonly validation = POST_FORM_VALIDATION;

  private readonly focusedField = signal<keyof PostFormValue | null>(null);
  private readonly loadedPostId = signal<string | null>(null);

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

      if (!value || value.id === this.loadedPostId()) {
        return;
      }

      this.loadedPostId.set(value.id);
      this.form.patchValue(
        {
          title: value.title,
          author: value.author,
          description: value.description,
          content: value.content,
        },
        { emitEvent: false },
      );
      this.form.markAsPristine();
    });

    effect(() => {
      if (this.hideAuthor()) {
        this.form.controls.author.setValue(this.authorDisplayName(), { emitEvent: false });
      }
    });
  }

  public hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  public trySubmit(): void {
    this.onSubmit();
  }

  public onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }

  public onSubmitAttempt(event: MouseEvent): void {
    if (this.submitting() || this.canSubmit()) {
      return;
    }

    event.preventDefault();
    this.form.markAllAsTouched();
  }

  public onCancelClick(): void {
    this.cancelClick.emit();
  }

  public canSubmit(): boolean {
    return this.form.valid;
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

  public getError(controlName: keyof PostFormValue): PostFormControlError | null {
    if (!this.isInvalid(controlName)) {
      return null;
    }

    return getPostFormControlError(this.form.controls[controlName].errors);
  }
}
