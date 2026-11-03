
import { Injectable, inject } from '@angular/core';

import { StoreService } from './store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private store = inject(StoreService);

  // Login
  login(): void {
    this.store.setAuthenticated(true);
  }

  // Logout
  logout(): void {
    this.store.setAuthenticated(false);
  }

  // Get current authentication status
  get isLoggedIn(): boolean {
    return this.store.getState().isAuthenticated;
  }
}
