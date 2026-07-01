import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-error-state',
  imports: [TranslatePipe],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
})
export class ErrorStateComponent {
  public readonly title = input('errors.genericTitle');
  public readonly message = input('errors.genericMessage');
  public readonly retryLabel = input('common.tryAgain');
  public readonly retry = output<void>();
}
