
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSignal = signal<ToastMessage | null>(null);

  toast = this.toastSignal.asReadonly();

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly duration = 2500;

  showError(message: string): void {
    this.showToast(message, 'error');
  }

  showSuccess(message: string): void {
    this.showToast(message, 'success');
  }

  private showToast(
    message: string,
    type: 'success' | 'error'
  ): void {

    // Clear the previous timer if another toast appears.
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.toastSignal.set({
      message,
      type
    });

    // Automatically dismiss the toast after 2.5 seconds.
    this.timeoutId = setTimeout(() => {
      this.clear();
    }, this.duration);
  }

  clear(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.toastSignal.set(null);
  }
}
