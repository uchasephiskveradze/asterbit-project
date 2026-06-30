import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Post } from '../../models/post.model';

@Component({
  selector: 'app-posts-table',
  imports: [DatePipe, RouterLink],
  templateUrl: './posts-table.component.html',
  styleUrl: './posts-table.component.scss',
})
export class PostsTableComponent {
  public readonly posts = input.required<Post[]>();
}
