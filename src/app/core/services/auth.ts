
import { Injectable, inject } from '@angular/core';

import { StoreService, UserRole } from './store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private store = inject(StoreService);

  // Login with selected role and username
  login(role: UserRole, username: string): void {
    this.store.setAuthenticated(true, role, username);
  }

  // Logout and clear authentication, role and username
  logout(): void {
    this.store.setAuthenticated(false);
  }

  // Get current authentication status
  get isLoggedIn(): boolean {
    return this.store.getState().isAuthenticated;
  }

  // Get current user role
  get role(): UserRole | null {
    return this.store.getState().role;
  }

  // Get current username
  get username(): string | null {
    return this.store.getState().username;
  }

  // Check whether current user is Admin
  get isAdmin(): boolean {
    return this.role === 'Admin';
  }

  // Check whether current user is Viewer
  get isViewer(): boolean {
    return this.role === 'Viewer';
  }
}
