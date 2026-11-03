
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

// Tracks all active HTTP requests.
let activeRequests = 0;

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const store = inject(StoreService);

  // Increment the active request counter.
  activeRequests++;

  // Show loader when the first request starts.
  store.setLoading(activeRequests > 0);

  // Generate a unique request ID.
  const requestId = crypto.randomUUID();

  // Add the request ID header.
  const modifiedRequest = req.clone({
    setHeaders: {
      'X-Request-Id': requestId
    }
  });

  // Record request start time.
  const startTime = performance.now();

  // Retry GET requests twice with a 1-second delay.
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
      if (error.status === 401) {
        router.navigate(['/login']);
      }

      if (error.status === 500) {
        toastService.showError(
          'Something went wrong on the server. Please try again later.'
        );
      }

      return throwError(() => error);
    }),

    finalize(() => {
      const duration = performance.now() - startTime;

      console.log(
        `[HTTP] ${req.method} ${req.urlWithParams} - ${duration.toFixed(2)} ms`
      );

      // Decrement when the request completes, errors or is cancelled.
      activeRequests = Math.max(0, activeRequests - 1);

      // Hide loader only when ALL requests have completed.
      store.setLoading(activeRequests > 0);
    })
  );
};
