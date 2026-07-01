import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LocaleService } from '../../../../core/i18n/locale.service';
import { PostFieldChange, PostRevisionSnapshot } from '../../models/post-revision.model';

@Component({
  selector: 'app-post-revision-panel',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './post-revision-panel.component.html',
  styleUrl: './post-revision-panel.component.scss',
})
export class PostRevisionPanelComponent {
  public readonly changes = input.required<PostFieldChange[]>();
  public readonly previousVersion = input.required<PostRevisionSnapshot>();

  protected readonly locale = inject(LocaleService);
}
