import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.scss',
})
export class NotFoundPage implements AfterViewInit {
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  public ngAfterViewInit(): void {
    this.heading().nativeElement.focus();
  }
}
