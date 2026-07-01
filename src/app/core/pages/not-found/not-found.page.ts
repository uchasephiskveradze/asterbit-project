import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.scss',
})
export class NotFoundPage implements AfterViewInit {
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  public ngAfterViewInit(): void {
    this.heading().nativeElement.focus();
  }
}
