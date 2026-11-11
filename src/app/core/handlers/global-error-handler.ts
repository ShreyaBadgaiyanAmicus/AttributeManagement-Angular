import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorLogService } from '../services/error-log';
import { ToastService } from '../services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  private errorLogService = inject(ErrorLogService);
  private toastService = inject(ToastService);

  handleError(error: unknown): void {

    const message = error instanceof Error
      ? error.message
      : 'An unexpected application error occurred.';

    const source = error instanceof Error
      ? error.name
      : 'Application';

    // Store the error for Admin review
    this.errorLogService.logError(message, source);

    // Show a friendly message to the user
    this.toastService.showError(
      'Something went wrong. Please try again.'
    );

    // Log details for developer debugging
    console.error('Unhandled application error:', error);
  }
}