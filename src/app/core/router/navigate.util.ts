import { NavigationExtras, Router } from '@angular/router';

export function navigateSafely(
  router: Router,
  commands: unknown[],
  extras?: NavigationExtras,
): void {
  void router.navigate(commands, extras).catch((error: unknown) => {
    console.error('Navigation failed', error);
  });
}
