
import { AsyncPipe } from '@angular/common';

import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  DestroyRef,
  inject
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  IAttribute,
  ICustomerLocation
} from '../../models/attribute.model';

import { LookupService } from '../../services/lookup';
import { StoreService } from '../../../../core/services/store';

@Component({
  selector: 'app-add-attribute',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule
  ],
  templateUrl: './add-attribute.html',
  styleUrl: './add-attribute.css'
})
export class AddAttributeComponent implements OnInit {

  @Output() back = new EventEmitter<void>();
  @Output() attributeAdded = new EventEmitter<IAttribute>();

  private destroyRef = inject(DestroyRef);
  private store = inject(StoreService);

  // Observable containing centralized lookup data
  lookups$ = this.store.lookups$;

  // Locations filtered according to selected Business Unit
  customerLocations: ICustomerLocation[] = [];

  submitted = false;
  successMessage = '';

  attributeForm = new FormGroup({
    AttributeName: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        this.noSpecialCharacters
      ]
    }),
    BusinessUnitId: new FormControl<number | null>(
      null,
      Validators.required
    ),
    CustomerLocationId: new FormControl<number | null>(
      null,
      Validators.required
    ),
    CompanyId: new FormControl<number | null>(
      null,
      Validators.required
    ),
    IsActive: new FormControl(true, { nonNullable: true })
  });

  constructor(private lookupService: LookupService) {}

  ngOnInit(): void {

    // Subscribe to centralized lookup state
    this.lookups$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lookups => {

        const businessId =
          this.attributeForm.controls.BusinessUnitId.value;

        this.customerLocations = businessId === null
          ? []
          : lookups.customerLocations.filter(
              location => location.businessUnitId === businessId
            );
      });

    // Fetch only lookup data that is not already available
    const lookups = this.store.getState().lookups;

    if (lookups.businessUnits.length === 0) {
      this.lookupService.getBusinessUnits().subscribe({
        error: error =>
          console.error('Failed to load business units:', error)
      });
    }

    if (lookups.customerLocations.length === 0) {
      this.lookupService.getCustomerLocations().subscribe({
        error: error =>
          console.error('Failed to load customer locations:', error)
      });
    }

    if (lookups.companies.length === 0) {
      this.lookupService.getCompanies().subscribe({
        error: error =>
          console.error('Failed to load companies:', error)
      });
    }
  }

  noSpecialCharacters(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    return /^[a-zA-Z0-9 -]+$/.test(value)
      ? null
      : { specialCharacters: true };
  }

  onBusinessUnitChange(): void {
    const businessId =
      this.attributeForm.controls.BusinessUnitId.value;

    this.attributeForm.controls.CustomerLocationId.reset(null);

    if (businessId === null) {
      this.customerLocations = [];
      return;
    }

    // Filter locations from centralized Store
    const allLocations = this.store.getState().lookups.customerLocations;

    this.customerLocations = allLocations.filter(
      location => location.businessUnitId === businessId
    );
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';

    if (this.attributeForm.invalid) {
      this.attributeForm.markAllAsTouched();
      return;
    }

    const formValue = this.attributeForm.getRawValue();
    const lookups = this.store.getState().lookups;

    const selectedBusinessUnit = lookups.businessUnits.find(
      unit => unit.businessId === formValue.BusinessUnitId
    );

    const selectedLocation = this.customerLocations.find(
      location =>
        location.customerLocationId === formValue.CustomerLocationId
    );

    const selectedCompany = lookups.companies.find(
      company => company.companyId === formValue.CompanyId
    );

    if (!selectedBusinessUnit || !selectedLocation || !selectedCompany) {
      return;
    }

    const newAttribute: IAttribute = {
      attributeId: 0,
      attributeName: formValue.AttributeName!.trim(),
      businessUnitId: selectedBusinessUnit.businessId,
      customerLocationId: selectedLocation.customerLocationId,
      companyId: selectedCompany.companyId,
      businessUnitName: selectedBusinessUnit.businessName,
      customerLocationName: selectedLocation.customerLocationName,
      companyName: selectedCompany.companyName,
      isActive: formValue.IsActive,
      createdOn: new Date(),
      createdBy: 'Current User',
      updatedOn: null,
      updatedBy: null
    };

    this.attributeAdded.emit(newAttribute);

    this.attributeForm.reset({
      AttributeName: '',
      BusinessUnitId: null,
      CustomerLocationId: null,
      CompanyId: null,
      IsActive: true
    });

    this.customerLocations = [];
    this.submitted = false;
  }
}
