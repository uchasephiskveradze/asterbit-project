import { FormControl } from '@angular/forms';

export interface PostFormValue {
  title: string;
  author: string;
  description: string;
  content: string;
}

export type PostFormControls = {
  title: FormControl<string>;
  author: FormControl<string>;
  description: FormControl<string>;
  content: FormControl<string>;
};
