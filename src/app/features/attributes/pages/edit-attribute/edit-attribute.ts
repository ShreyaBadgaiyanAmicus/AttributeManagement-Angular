import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IAttribute } from '../../models/attribute.model';

@Component({
  selector: 'app-edit-attribute',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-attribute.html',
  styleUrl: './edit-attribute.css'
})
export class EditAttributeComponent {
  @Input({ required: true }) attribute!: IAttribute;
  @Output() save = new EventEmitter<IAttribute>();
  @Output() cancel = new EventEmitter<void>();

  editedAttribute!: IAttribute;
  originalAttribute!: IAttribute;

  ngOnInit(): void {
    this.originalAttribute = { ...this.attribute };
    this.editedAttribute = { ...this.attribute };
  }

  get hasUnsavedChanges(): boolean {
    return Object.keys(this.originalAttribute).some(
      key =>
        this.originalAttribute[key as keyof IAttribute] !==
        this.editedAttribute[key as keyof IAttribute]
    );
  }

  onSave(): void {
    this.save.emit({ ...this.editedAttribute });
  }

  onCancel(): void {
    if (this.hasUnsavedChanges) {
      const leave = confirm('You have unsaved changes. Are you sure you want to leave?');

      if (!leave) {
        return;
      }
    }

    this.cancel.emit();
  }
}
