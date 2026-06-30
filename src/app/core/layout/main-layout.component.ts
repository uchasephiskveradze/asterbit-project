import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { IsAdminDirective } from '../auth/directives/is-admin.directive';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IsAdminDirective],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  public readonly auth = inject(AuthService);
}
