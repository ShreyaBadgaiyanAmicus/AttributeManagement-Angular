
import { AsyncPipe } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  DestroyRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  IAttribute,
  ICustomerLocation
} from '../../models/attribute.model';

import { LookupService } from '../../services/lookup';
import { StoreService } from '../../../../core/services/store';

@Component({
  selector: 'app-edit-attribute',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule
  ],
  templateUrl: './edit-attribute.html',
  styleUrl: './edit-attribute.css'
})
export class EditAttributeComponent implements OnInit {
  @Input({ required: true }) attribute!: IAttribute;

  @Output() save = new EventEmitter<IAttribute>();
  @Output() cancel = new EventEmitter<void>();

  private destroyRef = inject(DestroyRef);
  private store = inject(StoreService);

  lookups$ = this.store.lookups$;

  editedAttribute!: IAttribute;
  originalAttribute!: IAttribute;

  customerLocations: ICustomerLocation[] = [];

  constructor(private lookupService: LookupService) {}

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
      return;
    }

    this.editedAttribute.businessUnitName =
      selectedBusinessUnit.businessName;

    this.editedAttribute.customerLocationName =
      selectedLocation.customerLocationName;

    this.editedAttribute.companyName =
      selectedCompany.companyName;

    const savedAttribute = { ...this.editedAttribute };

    this.save.emit(savedAttribute);
  }

  onCancel(): void {
    if (this.hasUnsavedChanges) {
      const leave = confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );

      if (!leave) {
        return;
      }
    }

    this.cancel.emit();
  }
}
