
import {
  Component,
  ChangeDetectorRef,
  DestroyRef,
  inject
} from '@angular/core';

import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  startWith,
  of
} from 'rxjs';

import { AttributeService } from '../../services/attribute';
import { IAttribute } from '../../models/attribute.model';

import {
  StoreService,
  UserRole
} from '../../../../core/services/store';

import { AuthService } from '../../../../core/services/auth';
import { AttributeCardComponent } from '../../components/attribute-card/attribute-card';

import { ActiveStatus } from '../../../../shared/directives/active-status';
import { RoleBadge } from '../../../../shared/directives/role-badge';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time-pipe';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-attribute-list',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    AttributeCardComponent,
    ActiveStatus,
    RoleBadge,
    RelativeTimePipe
  ],
  templateUrl: './attribute-list.html',
  styleUrl: './attribute-list.css'
})
export class AttributeListComponent {

  private destroyRef = inject(DestroyRef);
  private store = inject(StoreService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Observable from centralized Store
  attributes$ = this.store.attributes$;

  viewMode: 'table' | 'card' = 'table';

  searchControl = new FormControl('', { nonNullable: true });
  isSearching = false;

  successMessage = '';

  // Check whether current user is Admin
  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  // Logged-in username
  get username(): string {
    return this.authService.username ?? 'User';
  }

  // Logged-in user's role
  get role(): UserRole | null {
    return this.authService.role;
  }

  constructor(
    private attributeService: AttributeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      startWith(''),

      tap(() => {
        this.isSearching = true;
        this.cdr.markForCheck();
      }),

      debounceTime(300),
      distinctUntilChanged(),

      switchMap(searchTerm =>
        this.attributeService.searchAttributes(searchTerm).pipe(
          catchError(error => {
            console.error('Failed to search attributes:', error);

            this.toastService.showError(
              'Unable to search attributes. Please try again.'
            );

            return of([]);
          })
        )
      ),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe(() => {
      this.isSearching = false;
      this.cdr.markForCheck();
    });
  }

  // Switch between table and card views
  setView(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }

  // Navigate to Add Attribute route
  openAddAttribute(): void {
    this.successMessage = '';
    this.router.navigate(['/attributes/add']);
  }

  // Navigate to Edit Attribute route
  openEditAttribute(attribute: IAttribute): void {
    if (!this.isAdmin) {
      return;
    }

    this.successMessage = '';

    this.router.navigate([
      '/attributes',
      attribute.attributeId,
      'edit'
    ]);
  }

  // Delete Attribute (Admin only)
  deleteAttribute(attribute: IAttribute): void {
    if (!this.isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${attribute.attributeName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.attributeService
      .deleteAttribute(attribute.attributeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            'Attribute deleted successfully.'
          );
        },
        error: error => {
          console.error('Failed to delete attribute:', error);

          this.toastService.showError(
            'Unable to delete attribute. Please try again.'
          );
        }
      });
  }

  // Logout current user
  logout(): void {
    this.authService.logout();

    this.toastService.showSuccess(
      'Logged out successfully.'
    );

    this.router.navigate(['/login']);
  }
}
