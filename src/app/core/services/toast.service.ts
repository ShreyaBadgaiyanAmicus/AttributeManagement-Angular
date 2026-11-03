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

  showError(message: string): void {
    this.toastSignal.set({
      message,
      type: 'error'
    });
  }

  showSuccess(message: string): void {
    this.toastSignal.set({
      message,
      type: 'success'
    });
    
  }

  clear(): void {
    this.toastSignal.set(null);
  }
}