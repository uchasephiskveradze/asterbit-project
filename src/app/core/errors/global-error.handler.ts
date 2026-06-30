import { ErrorHandler, inject, Injectable } from '@angular/core';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly auth = inject(AuthService);

  public handleError(error: unknown): void {
    console.error('Unhandled application error', error);

    if (error instanceof Error && error.message.includes('401')) {
      this.auth.logout();
    }
  }
}
