import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { PostFieldChange, PostRevisionSnapshot } from '../../models/post-revision.model';

@Component({
  selector: 'app-post-revision-panel',
  imports: [DatePipe],
  templateUrl: './post-revision-panel.component.html',
  styleUrl: './post-revision-panel.component.scss',
})
export class PostRevisionPanelComponent {
  public readonly changes = input.required<PostFieldChange[]>();
  public readonly previousVersion = input.required<PostRevisionSnapshot>();
}
