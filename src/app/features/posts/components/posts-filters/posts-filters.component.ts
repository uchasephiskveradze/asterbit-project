import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PostDateSort } from '../../store/posts-list.types';

@Component({
  selector: 'app-posts-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './posts-filters.component.html',
  styleUrl: './posts-filters.component.scss',
})
export class PostsFiltersComponent {
  public readonly searchQuery = input('');
  public readonly sortOrder = input<PostDateSort>('desc');

  public readonly searchChange = output<string>();
  public readonly sortChange = output<PostDateSort>();

  public readonly searchControl = new FormControl('', { nonNullable: true });
  public readonly sortControl = new FormControl<PostDateSort>('desc', {
    nonNullable: true,
  });

  private readonly destroyRef = inject(DestroyRef);

  public constructor() {
    effect(() => {
      const query = this.searchQuery();
      if (this.searchControl.value !== query) {
        this.searchControl.setValue(query, { emitEvent: false });
      }
    });

    effect(() => {
      const order = this.sortOrder();
      if (this.sortControl.value !== order) {
        this.sortControl.setValue(order, { emitEvent: false });
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => this.searchChange.emit(value));

    this.sortControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.sortChange.emit(value));
  }
}
