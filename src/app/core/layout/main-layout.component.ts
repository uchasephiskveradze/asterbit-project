import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../auth/services/auth.service';
import { LocaleService } from '../i18n/locale.service';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  public readonly auth = inject(AuthService);
  public readonly locale = inject(LocaleService);
  public readonly theme = inject(ThemeService);
}
