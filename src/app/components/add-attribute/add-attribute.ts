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
      validators: [Validators.required, Validators.minLength(3), this.noSpecialCharacters],
    }),
    BusinessUnitId: new FormControl<number | null>(null, Validators.required),
    CustomerLocationId: new FormControl<number | null>(null, Validators.required),
    CompanyId: new FormControl<number | null>(null, Validators.required),
    IsActive: new FormControl(true, { nonNullable: true }),
  });

  constructor(private lookupService: LookupService) {
    this.businessUnits = this.lookupService.getBusinessUnits();
    this.companies = this.lookupService.getCompanies();
  }

  noSpecialCharacters(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    return /^[a-zA-Z0-9 -]+$/.test(value) ? null : { specialCharacters: true };
  }

  onBusinessUnitChange(): void {
    const businessId = this.attributeForm.controls.BusinessUnitId.value;

    this.customerLocations =
      businessId === null ? [] : this.lookupService.getLocationsByBusinessUnit(businessId);

    this.attributeForm.controls.CustomerLocationId.reset(null);
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
      (unit) => unit.BusinessId === formValue.BusinessUnitId,
    );

    const selectedLocation = this.customerLocations.find(
      (location) => location.CustomerLocationId === formValue.CustomerLocationId,
    );

    const selectedCompany = this.companies.find(
      (company) => company.CompanyId === formValue.CompanyId,
    );

    if (!selectedBusinessUnit || !selectedLocation || !selectedCompany) {
      return;
    }

    const newAttribute: IAttribute = {
      AttributeId: 0,
      AttributeName: formValue.AttributeName!.trim(),
      BusinessUnitName: selectedBusinessUnit.BusinessName,
      CustomerLocationName: selectedLocation.CustomerLocationName,
      CompanyName: selectedCompany.CompanyName,
      IsActive: formValue.IsActive,
      CreatedOn: new Date(),
      CreatedBy: 'Current User',
      UpdatedOn: null,
      UpdatedBy: null,
    };

    this.attributeAdded.emit(newAttribute);
    this.successMessage = 'Attribute added successfully!';
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
