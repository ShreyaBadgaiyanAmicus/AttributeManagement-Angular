
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  DestroyRef,
  inject
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  startWith,
  of,
  interval
} from 'rxjs';

import { AttributeService } from '../../services/attribute';
import { IAttribute } from '../../models/attribute.model';

import { AddAttributeComponent } from '../add-attribute/add-attribute';
import { EditAttributeComponent } from '../edit-attribute/edit-attribute';
import { AttributeCardComponent } from '../../components/attribute-card/attribute-card';

import { ActiveStatus } from '../../../../shared/directives/active-status';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time-pipe';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-attribute-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    AttributeCardComponent,
    ActiveStatus,
    RelativeTimePipe,
    AddAttributeComponent,
    EditAttributeComponent
  ],
  templateUrl: './attribute-list.html',
  styleUrl: './attribute-list.css'
})
export class AttributeListComponent implements OnInit {

  private destroyRef = inject(DestroyRef);

  attributes: IAttribute[] = [];

  viewMode: 'table' | 'card' = 'table';

  searchControl = new FormControl('', { nonNullable: true });
  isSearching = false;

  showAddAttribute = false;
  selectedAttribute: IAttribute | null = null;
  successMessage = '';

  constructor(
    private attributeService: AttributeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupSearch();
  }

  ngOnInit(): void {
    // Temporary subscription for Bug A demonstration.
    // takeUntilDestroyed automatically unsubscribes when this component is destroyed.
    interval(2000)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(count => {
        console.log('AttributeList subscription:', count);
      });
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
      )
    ).subscribe(attributes => {
      this.attributes = attributes;
      this.isSearching = false;
      this.cdr.markForCheck();
    });
  }

  // Switch between table and card views
  setView(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }

  // Open Add Attribute form
  openAddAttribute(): void {
    this.successMessage = '';
    this.showAddAttribute = true;
    this.selectedAttribute = null;
  }

  // Return to Attribute List
  backToAttributeList(): void {
    this.showAddAttribute = false;
  }

  // Add a new attribute
  addAttribute(newAttribute: IAttribute): void {
    const nextId = this.attributes.length > 0
      ? Math.max(
          ...this.attributes.map(attribute => attribute.attributeId)
        ) + 1
      : 1;

    const attributeWithId: IAttribute = {
      ...newAttribute,
      attributeId: nextId
    };

    this.attributeService.addAttribute(attributeWithId).subscribe({
      next: savedAttribute => {
        this.attributes = [...this.attributes, savedAttribute];

        this.showAddAttribute = false;

        this.successMessage =
          `"${savedAttribute.attributeName}" added successfully!`;

        this.toastService.showSuccess(this.successMessage);
      },
      error: error => {
        console.error('Failed to add attribute:', error);

        this.toastService.showError(
          'Unable to add attribute. Please try again.'
        );
      }
    });
  }

  // Open Edit Attribute form
  openEditAttribute(attribute: IAttribute): void {
    this.successMessage = '';
    this.showAddAttribute = false;
    this.selectedAttribute = { ...attribute };
  }

  // Save edited attribute
  saveEditedAttribute(updatedAttribute: IAttribute): void {
    this.attributeService.updateAttribute(
      updatedAttribute.attributeId,
      updatedAttribute
    ).subscribe({
      next: savedAttribute => {
        this.attributes = this.attributes.map(attribute =>
          attribute.attributeId === savedAttribute.attributeId
            ? savedAttribute
            : attribute
        );

        this.selectedAttribute = null;

        this.successMessage =
          `"${savedAttribute.attributeName}" updated successfully!`;

        this.toastService.showSuccess(this.successMessage);
      },
      error: error => {
        console.error('Failed to update attribute:', error);

        this.toastService.showError(
          'Unable to update attribute. Please try again.'
        );
      }
    });
  }

  // Cancel Edit
  cancelEditAttribute(): void {
    this.selectedAttribute = null;
  }
}
