import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';
import { IsAdminDirective } from '../auth/directives/is-admin.directive';
import { IsAuthenticatedDirective } from '../auth/directives/is-authenticated.directive';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IsAdminDirective, IsAuthenticatedDirective],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  public readonly auth = inject(AuthService);
  public readonly theme = inject(ThemeService);
}
