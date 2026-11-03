
import { Component, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AttributeService } from '../../services/attribute';
import { IAttribute } from '../../models/attribute.model';

import { AddAttributeComponent } from '../add-attribute/add-attribute';
import { EditAttributeComponent } from '../edit-attribute/edit-attribute';
import { AttributeCardComponent } from '../../components/attribute-card/attribute-card';

import { ActiveStatus } from '../../../../shared/directives/active-status';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time-pipe';
import { FilterBy } from '../../../../shared/directives/filter-by';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-attribute-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    AttributeCardComponent,
    ActiveStatus,
    RelativeTimePipe,
    FilterBy,
    AddAttributeComponent,
    EditAttributeComponent
  ],
  templateUrl: './attribute-list.html',
  styleUrl: './attribute-list.css'
})
export class AttributeListComponent {
  attributes: IAttribute[] = [];

  viewMode: 'table' | 'card' = 'table';
  searchTerm = '';

  showAddAttribute = false;
  selectedAttribute: IAttribute | null = null;
  successMessage = '';

  constructor(
    private attributeService: AttributeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadAttributes();
  }

  // Load attributes from JSON Server
  loadAttributes(): void {
    this.attributeService.getAttributes().subscribe({
      next: attributes => {
        this.attributes = attributes;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load attributes:', error);

        this.toastService.showError(
          'Unable to load attributes. Please try again.'
        );
      }
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
