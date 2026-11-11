
import { inject } from '@angular/core';

import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { Router } from '@angular/router';

import {
  catchError,
  finalize,
  retry,
  throwError
} from 'rxjs';

import { ToastService } from '../services/toast.service';
import { StoreService } from '../services/store';
import { ErrorLogService } from '../services/error-log';

// Tracks all active HTTP requests.
let activeRequests = 0;

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const store = inject(StoreService);
  const errorLogService = inject(ErrorLogService);

  activeRequests++;
  store.setLoading(activeRequests > 0);

  const requestId = crypto.randomUUID();

  const modifiedRequest = req.clone({
    setHeaders: {
      'X-Request-Id': requestId
    }
  });

  const startTime = performance.now();

  const response$ = next(modifiedRequest);

  const request$ = req.method === 'GET'
    ? response$.pipe(
        retry({
          count: 2,
          delay: 1000
        })
      )
    : response$;

  return request$.pipe(
    catchError((error: HttpErrorResponse) => {

      let message = 'Server error, try again';

      switch (error.status) {
        case 400:
          message = 'Invalid request';
          break;

        case 401:
          message = 'Please log in';
          router.navigate(['/login']);
          break;

        case 403:
          message = 'Access denied';
          break;

        case 404:
          message = 'Not found';
          break;

        default:
          if (error.status >= 500) {
            message = 'Server error, try again';
          }
      }

      // Log HTTP error without storing stack traces.
      errorLogService.logError(
        `${message} (HTTP ${error.status})`,
        `${req.method} ${req.urlWithParams}`
      );

      // Display the categorized error.
      toastService.showError(message);

      return throwError(() => error);
    }),

    finalize(() => {
      const duration = performance.now() - startTime;

      console.log(
        `[HTTP] ${req.method} ${req.urlWithParams} - ${duration.toFixed(2)} ms`
      );

      activeRequests = Math.max(0, activeRequests - 1);
      store.setLoading(activeRequests > 0);
    })
  );
};
