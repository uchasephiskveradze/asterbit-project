import {
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Post } from '../../models/post.model';
import { PostFormControls, PostFormValue } from './types/post-form.types';

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

  private readonly fb = inject(FormBuilder);

  public readonly form = this.fb.group<PostFormControls>({
    title: this.fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
      ],
    }),
    author: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    description: this.fb.control('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
      ],
    }),
    content: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20)],
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

  public isInvalid(controlName: keyof PostFormValue): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
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
