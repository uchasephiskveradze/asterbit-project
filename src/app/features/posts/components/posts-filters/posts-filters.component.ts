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
import { TranslatePipe } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs';

import { PostDateSort } from '../../store/posts-list.types';
import { PostsListViewMode } from '../../models/posts-list-view-mode.model';

@Component({
  selector: 'app-posts-filters',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './posts-filters.component.html',
  styleUrl: './posts-filters.component.scss',
})
export class PostsFiltersComponent {
  public readonly searchQuery = input('');
  public readonly sortOrder = input<PostDateSort>('desc');
  public readonly filtering = input(false);
  public readonly viewMode = input<PostsListViewMode>('pagination');

  public readonly searchChange = output<string>();
  public readonly sortChange = output<PostDateSort>();
  public readonly viewModeChange = output<PostsListViewMode>();

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
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.searchChange.emit(value));

    this.sortControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.sortChange.emit(value));
  }

  public selectViewMode(mode: PostsListViewMode): void {
    this.viewModeChange.emit(mode);
  }
}
