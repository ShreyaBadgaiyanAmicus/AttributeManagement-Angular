
import {
  Component,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ErrorLogService } from '../../../core/services/error-log';

@Component({
  selector: 'app-errors',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './errors.html',
  styleUrl: './errors.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorsComponent {

  private errorLogService = inject(ErrorLogService);
  private http = inject(HttpClient);

  errors = this.errorLogService.errors;

  clearErrors(): void {
    this.errorLogService.clearErrors();
  }

  // Trigger a real HTTP 404 error for testing.
  testHttpError(): void {
    this.http.get('http://localhost:3000/invalid-endpoint')
      .subscribe({
        error: () => {
          // The HTTP interceptor logs the error.
        }
      });
  }
  testGlobalError(): void {
  throw new Error('Testing global error handler');
}
}
