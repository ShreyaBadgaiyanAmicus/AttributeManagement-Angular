
import { AsyncPipe } from '@angular/common';

import {
  Component,
  Input,
  OnInit,
  DestroyRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  IAttribute,
  ICustomerLocation
} from '../../models/attribute.model';

import { AttributeService } from '../../services/attribute';
import { LookupService } from '../../services/lookup';

import { StoreService } from '../../../../core/services/store';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-edit-attribute',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-attribute.html',
  styleUrl: './edit-attribute.css'
})
export class EditAttributeComponent implements OnInit {

  @Input({ required: true }) attribute!: IAttribute;

  private destroyRef = inject(DestroyRef);
  private store = inject(StoreService);
  private router = inject(Router);
  private attributeService = inject(AttributeService);
  private toastService = inject(ToastService);

  lookups$ = this.store.lookups$;

  editedAttribute!: IAttribute;
  originalAttribute!: IAttribute;

  customerLocations: ICustomerLocation[] = [];

  constructor(
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.originalAttribute = { ...this.attribute };
    this.editedAttribute = { ...this.attribute };

    // Keep dependent locations synchronized with the Store.
    this.lookups$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lookups => {
        this.updateCustomerLocations(
          lookups.customerLocations,
          this.editedAttribute.businessUnitId
        );

        this.cdr.markForCheck();
      });

    // Load only lookup data that is not already in the Store.
    const lookups = this.store.getState().lookups;

    if (lookups.businessUnits.length === 0) {
      this.lookupService.getBusinessUnits()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: error =>
            console.error('Failed to load business units:', error)
        });
    }

    if (lookups.customerLocations.length === 0) {
      this.lookupService.getCustomerLocations()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: error =>
            console.error('Failed to load customer locations:', error)
        });
    }

    if (lookups.companies.length === 0) {
      this.lookupService.getCompanies()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: error =>
            console.error('Failed to load companies:', error)
        });
    }
  }

  private updateCustomerLocations(
    locations: (ICustomerLocation & { businessUnitId: number })[],
    businessId: number
  ): void {
    this.customerLocations = locations.filter(
      location => location.businessUnitId === businessId
    );
  }

  onBusinessUnitChange(businessId: number): void {
    this.editedAttribute.customerLocationId = null as unknown as number;
    this.editedAttribute.customerLocationName = '';

    const locations = this.store.getState().lookups.customerLocations;

    this.updateCustomerLocations(locations, businessId);
  }

  get hasUnsavedChanges(): boolean {
    return Object.keys(this.originalAttribute).some(
      key =>
        this.originalAttribute[key as keyof IAttribute] !==
        this.editedAttribute[key as keyof IAttribute]
    );
  }

  onSave(): void {
    const lookups = this.store.getState().lookups;

    const selectedBusinessUnit = lookups.businessUnits.find(
      unit => unit.businessId === this.editedAttribute.businessUnitId
    );

    const selectedLocation = this.customerLocations.find(
      location =>
        location.customerLocationId ===
        this.editedAttribute.customerLocationId
    );

    const selectedCompany = lookups.companies.find(
      company => company.companyId === this.editedAttribute.companyId
    );

    if (!selectedBusinessUnit || !selectedLocation || !selectedCompany) {
      this.toastService.showError(
        'Please select valid Business Unit, Customer Location and Company.'
      );
      return;
    }

    const savedAttribute: IAttribute = {
      ...this.editedAttribute,
      attributeName: this.editedAttribute.attributeName.trim(),
      businessUnitName: selectedBusinessUnit.businessName,
      customerLocationName: selectedLocation.customerLocationName,
      companyName: selectedCompany.companyName,
      updatedOn: new Date(),
      updatedBy: 'Current User'
    };

    this.attributeService.updateAttribute(
      savedAttribute.attributeId,
      savedAttribute
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: updatedAttribute => {
        // Update the original copy only after a successful save.
        this.originalAttribute = { ...updatedAttribute };
        this.editedAttribute = { ...updatedAttribute };

        this.cdr.markForCheck();

        this.toastService.showSuccess(
          'Attribute updated successfully!'
        );

        this.router.navigate(['/attributes']);
      },
      error: error => {
        console.error('Failed to update attribute:', error);

        this.toastService.showError(
          'Failed to update attribute. Please try again.'
        );
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/attributes']);
  }
}
