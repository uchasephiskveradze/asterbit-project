import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  public handleError(error: unknown): void {
    console.error('Unhandled application error', error);
  }
}
