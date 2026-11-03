
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import {
  IAttribute,
  IBusinessUnit,
  ICustomerLocation,
  ICompany,
} from '../../models/attribute.model';

import { LookupService } from '../../services/lookup';

@Component({
  selector: 'app-add-attribute',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-attribute.html',
  styleUrl: './add-attribute.css',
})
export class AddAttributeComponent {
  @Output() back = new EventEmitter<void>();
  @Output() attributeAdded = new EventEmitter<IAttribute>();

  businessUnits: IBusinessUnit[] = [];
  customerLocations: ICustomerLocation[] = [];
  companies: ICompany[] = [];

  submitted = false;
  successMessage = '';

  attributeForm = new FormGroup({
    AttributeName: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        this.noSpecialCharacters,
      ],
    }),
    BusinessUnitId: new FormControl<number | null>(null, Validators.required),
    CustomerLocationId: new FormControl<number | null>(null, Validators.required),
    CompanyId: new FormControl<number | null>(null, Validators.required),
    IsActive: new FormControl(true, { nonNullable: true }),
  });

  constructor(private lookupService: LookupService) {
    // Fetch business units from API
    this.lookupService.getBusinessUnits().subscribe({
      next: units => this.businessUnits = units,
      error: error => console.error('Failed to load business units:', error)
    });

    // Fetch companies from API
    this.lookupService.getCompanies().subscribe({
      next: companies => this.companies = companies,
      error: error => console.error('Failed to load companies:', error)
    });
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
    const businessId = this.attributeForm.controls.BusinessUnitId.value;

    this.customerLocations = [];
    this.attributeForm.controls.CustomerLocationId.reset(null);

    if (businessId === null) {
      return;
    }

    // Fetch locations for selected business unit
    this.lookupService.getLocationsByBusinessUnit(businessId).subscribe({
      next: locations => this.customerLocations = locations,
      error: error => console.error('Failed to load customer locations:', error)
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';

    if (this.attributeForm.invalid) {
      this.attributeForm.markAllAsTouched();
      return;
    }

    const formValue = this.attributeForm.getRawValue();

    const selectedBusinessUnit = this.businessUnits.find(
      unit => unit.businessId === formValue.BusinessUnitId
    );

    const selectedLocation = this.customerLocations.find(
      location => location.customerLocationId === formValue.CustomerLocationId
    );

    const selectedCompany = this.companies.find(
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
      updatedBy: null,
    };

    this.attributeAdded.emit(newAttribute);

    this.attributeForm.reset({
      AttributeName: '',
      BusinessUnitId: null,
      CustomerLocationId: null,
      CompanyId: null,
      IsActive: true,
    });

    this.customerLocations = [];
    this.submitted = false;
  }
}
