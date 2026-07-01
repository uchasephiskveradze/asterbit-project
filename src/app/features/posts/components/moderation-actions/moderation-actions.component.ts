import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-moderation-actions',
  imports: [MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './moderation-actions.component.html',
  styleUrl: './moderation-actions.component.scss',
})
export class ModerationActionsComponent {
  public readonly disabled = input(false);
  public readonly loading = input(false);

  public readonly approve = output<void>();
  public readonly reject = output<void>();
}
