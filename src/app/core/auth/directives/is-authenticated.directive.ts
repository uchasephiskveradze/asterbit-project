import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appIsAuthenticated]',
})
export class IsAuthenticatedDirective {
  private readonly auth = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  public constructor() {
    effect(() => {
      this.viewContainer.clear();

      if (this.auth.isAuthenticated()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
