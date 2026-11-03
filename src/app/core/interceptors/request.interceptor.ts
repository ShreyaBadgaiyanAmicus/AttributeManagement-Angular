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

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Generate a unique request ID
  const requestId = crypto.randomUUID();

  // Add the request ID header
  const modifiedRequest = req.clone({
    setHeaders: {
      'X-Request-Id': requestId
    }
  });

  // Record request start time
  const startTime = performance.now();

  // Retry GET requests twice with a 1-second delay
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
    })
  );
};