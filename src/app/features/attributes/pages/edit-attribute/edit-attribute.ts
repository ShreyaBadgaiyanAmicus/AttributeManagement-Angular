
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  IAttribute,
  IBusinessUnit,
  ICustomerLocation,
  ICompany
} from '../../models/attribute.model';

import { LookupService } from '../../services/lookup';

@Component({
  selector: 'app-edit-attribute',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-attribute.html',
  styleUrl: './edit-attribute.css'
})
export class EditAttributeComponent implements OnInit {
  @Input({ required: true }) attribute!: IAttribute;

  @Output() save = new EventEmitter<IAttribute>();
  @Output() cancel = new EventEmitter<void>();

  editedAttribute!: IAttribute;
  originalAttribute!: IAttribute;

  businessUnits: IBusinessUnit[] = [];
  customerLocations: ICustomerLocation[] = [];
  companies: ICompany[] = [];

  constructor(private lookupService: LookupService) {}

  ngOnInit(): void {
    this.originalAttribute = { ...this.attribute };
    this.editedAttribute = { ...this.attribute };

    this.loadBusinessUnits();
    this.loadCompanies();
    this.loadCustomerLocations(this.attribute.businessUnitId);
  }

  loadBusinessUnits(): void {
    this.lookupService.getBusinessUnits().subscribe({
      next: units => this.businessUnits = units,
      error: error => console.error('Failed to load business units:', error)
    });
  }

  loadCompanies(): void {
    this.lookupService.getCompanies().subscribe({
      next: companies => this.companies = companies,
      error: error => console.error('Failed to load companies:', error)
    });
  }

  loadCustomerLocations(businessId: number): void {
    this.lookupService.getLocationsByBusinessUnit(businessId).subscribe({
      next: locations => this.customerLocations = locations,
      error: error => console.error('Failed to load customer locations:', error)
    });
  }

  onBusinessUnitChange(businessId: number): void {
    this.editedAttribute.customerLocationId = null as unknown as number;
    this.editedAttribute.customerLocationName = '';
    this.customerLocations = [];

    if (!businessId) {
      return;
    }

    this.loadCustomerLocations(businessId);
  }

  get hasUnsavedChanges(): boolean {
    return Object.keys(this.originalAttribute).some(
      key =>
        this.originalAttribute[key as keyof IAttribute] !==
        this.editedAttribute[key as keyof IAttribute]
    );
  }

  onSave(): void {
    const selectedBusinessUnit = this.businessUnits.find(
      unit => unit.businessId === this.editedAttribute.businessUnitId
    );

    const selectedLocation = this.customerLocations.find(
      location =>
        location.customerLocationId === this.editedAttribute.customerLocationId
    );

    const selectedCompany = this.companies.find(
      company => company.companyId === this.editedAttribute.companyId
    );

    if (!selectedBusinessUnit || !selectedLocation || !selectedCompany) {
      return;
    }

    this.editedAttribute.businessUnitName = selectedBusinessUnit.businessName;
    this.editedAttribute.customerLocationName = selectedLocation.customerLocationName;
    this.editedAttribute.companyName = selectedCompany.companyName;

    this.save.emit({ ...this.editedAttribute });
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
