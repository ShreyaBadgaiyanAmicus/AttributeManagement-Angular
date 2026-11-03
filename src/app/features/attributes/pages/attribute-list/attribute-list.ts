
import {
  Component,
  ChangeDetectorRef,
  DestroyRef,
  inject
} from '@angular/core';

import { DatePipe, AsyncPipe } from '@angular/common';
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

import { StoreService } from '../../../../core/services/store';
import { AttributeCardComponent } from '../../components/attribute-card/attribute-card';

import { ActiveStatus } from '../../../../shared/directives/active-status';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time-pipe';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-attribute-list',
  standalone: true,
  imports: [
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule,
    AttributeCardComponent,
    ActiveStatus,
    RelativeTimePipe
  ],
  templateUrl: './attribute-list.html',
  styleUrl: './attribute-list.css'
})
export class AttributeListComponent {

  private destroyRef = inject(DestroyRef);
  private store = inject(StoreService);
  private router = inject(Router);

  // Observable from centralized Store
  attributes$ = this.store.attributes$;

  viewMode: 'table' | 'card' = 'table';

  searchControl = new FormControl('', { nonNullable: true });
  isSearching = false;

  successMessage = '';

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
    this.successMessage = '';

    this.router.navigate([
      '/attributes',
      attribute.attributeId,
      'edit'
    ]);
  }
}
