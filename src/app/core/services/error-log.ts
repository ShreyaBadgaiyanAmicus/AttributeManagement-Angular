import { Injectable, signal } from '@angular/core';

export interface ErrorLog {
  id: number;
  message: string;
  source: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {

  private nextId = 1;

  private errorLogs = signal<ErrorLog[]>([]);

  // Read-only error logs for components
  errors = this.errorLogs.asReadonly();

  // Add a new error log
  logError(message: string, source: string): void {
    const errorLog: ErrorLog = {
      id: this.nextId++,
      message,
      source,
      timestamp: new Date()
    };

    this.errorLogs.update(logs => [errorLog, ...logs]);
  }

  // Clear all error logs
  clearErrors(): void {
    this.errorLogs.set([]);
  }

  
}