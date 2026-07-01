import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
})
export class ErrorStateComponent {
  public readonly title = input('Something went wrong');
  public readonly message = input('Unable to load content. Please try again.');
  public readonly retryLabel = input('Try again');
  public readonly retry = output<void>();
}
