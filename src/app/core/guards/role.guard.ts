
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';
import { ToastService } from '../services/toast.service';


export const roleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Redirect unauthenticated users to Login
  if (!authService.isLoggedIn) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // Allow only Admin users
  if (authService.isAdmin) {
    return true;
  }

  // Deny Viewer access
  toastService.showError('Access denied. Admin access is required.');

  return router.createUrlTree(['/attributes']);
};
