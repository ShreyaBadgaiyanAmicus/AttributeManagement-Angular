import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AttributeService } from '../../services/attribute';
import { IAttribute } from '../../models/attribute.model';
import { AttributeCardComponent } from '../attribute-card/attribute-card';
import { ActiveStatus } from '../../directives/active-status';
import { RelativeTimePipe } from '../../pipes/relative-time-pipe';
import { FilterBy } from '../../directives/filter-by';
import { FormsModule } from '@angular/forms';
import { AddAttributeComponent } from '../add-attribute/add-attribute';
import { EditAttributeComponent } from '../edit-attribute/edit-attribute';

@Component({
  selector: 'app-attribute-list',
  standalone: true,
  imports: [
    DatePipe,
    AttributeCardComponent,
    ActiveStatus,
    RelativeTimePipe,
    FilterBy,
    FormsModule,
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

  constructor(private attributeService: AttributeService) {
    this.attributes = this.attributeService.getAttributes();
  }

  setView(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }

  openAddAttribute(): void {
    this.successMessage = '';
    this.showAddAttribute = true;
    this.selectedAttribute = null;
  }

  backToAttributeList(): void {
    this.showAddAttribute = false;
  }

  addAttribute(newAttribute: IAttribute): void {
    const nextId = this.attributes.length > 0
      ? Math.max(
          ...this.attributes.map(attribute => attribute.AttributeId)
        ) + 1
      : 1;

    const attributeWithId: IAttribute = {
      ...newAttribute,
      AttributeId: nextId
    };

    this.attributes = [...this.attributes, attributeWithId];

    this.successMessage =
      `"${attributeWithId.AttributeName}" added successfully!`;
  }

  openEditAttribute(attribute: IAttribute): void {
    this.successMessage = '';
    this.showAddAttribute = false;
    this.selectedAttribute = { ...attribute };
  }

  saveEditedAttribute(updatedAttribute: IAttribute): void {
    this.attributes = this.attributes.map(attribute =>
      attribute.AttributeId === updatedAttribute.AttributeId
        ? updatedAttribute
        : attribute
    );

    this.selectedAttribute = null;
    this.successMessage =
      `"${updatedAttribute.AttributeName}" updated successfully!`;
  }

  cancelEditAttribute(): void {
    this.selectedAttribute = null;
  }
}
