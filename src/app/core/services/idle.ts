import { Injectable, DestroyRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  EMPTY,
  fromEvent,
  merge,
  switchMap,
  timer,
  startWith,
  distinctUntilChanged
} from 'rxjs';

import { StoreService } from './store';
import { AuthService } from './auth';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class IdleService {

  private document = inject(DOCUMENT);
  private store = inject(StoreService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

//   private readonly idleTimeout = 10 * 60 * 1000;
private readonly idleTimeout = 10 * 1000;
  private started = false;

  startWatching(): void {

    // Prevent multiple subscriptions
    if (this.started) {
      return;
    }

    this.started = true;

    // Listen for user activity
    const mouseMove$ = fromEvent(
      this.document,
      'mousemove'
    );

    const keydown$ = fromEvent(
      this.document,
      'keydown'
    );

    // Combine mouse and keyboard activity
    const activity$ = merge(
      mouseMove$,
      keydown$
    );

    // Start tracking only when authenticated
    this.store.isAuthenticated$.pipe(

      distinctUntilChanged(),

      switchMap(isAuthenticated => {

        if (!isAuthenticated) {
          return EMPTY;
        }

        return activity$.pipe(

          // Start the timer immediately after login
          startWith(null),

          // Reset the timer whenever activity occurs
          switchMap(() => timer(this.idleTimeout))

        );
      }),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe(() => {

      // Automatically log out after inactivity
      this.authService.logout();

      this.toastService.showError(
        'Session expired due to inactivity. Please log in again.'
      );

      this.router.navigate(['/login']);

    });
  }
}
