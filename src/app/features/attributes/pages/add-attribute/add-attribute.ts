
import { AsyncPipe } from '@angular/common';

import {
  Component,
  OnInit,
  DestroyRef,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import {
  IAttribute,
  ICustomerLocation
} from '../../models/attribute.model';

import { AttributeService } from '../../services/attribute';
import { LookupService } from '../../services/lookup';

import { StoreService } from '../../../../core/services/store';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-add-attribute',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-attribute.html',
  styleUrl: './add-attribute.css'
})
export class AddAttributeComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private store = inject(StoreService);
  private router = inject(Router);
  private attributeService = inject(AttributeService);
  private toastService = inject(ToastService);

  lookups$ = this.store.lookups$;

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

  onCancel(): void {
    this.router.navigate(['/attributes']);
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
      this.toastService.showError(
        'Please select valid Business Unit, Customer Location and Company.'
      );
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

    this.attributeService.getAttributes().pipe(
      switchMap(attributes => {
        const nextId = attributes.length > 0
          ? Math.max(...attributes.map(a => a.attributeId)) + 1
          : 1;

        return this.attributeService.addAttribute({
          ...newAttribute,
          attributeId: nextId
        });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.toastService.showSuccess(
          'Attribute added successfully!'
        );

        this.router.navigate(['/attributes']);
      },
      error: error => {
        console.error('Failed to add attribute:', error);

        this.toastService.showError(
          'Failed to add attribute. Please try again.'
        );
      }
    });
  }
}
