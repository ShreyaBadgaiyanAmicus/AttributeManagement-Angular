import { Injectable } from '@angular/core';
import {
  CanDeactivate
} from '@angular/router';

import {
  EditAttributeComponent
} from '../../features/attributes/pages/edit-attribute/edit-attribute';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard
  implements CanDeactivate<EditAttributeComponent> {

  canDeactivate(
    component: EditAttributeComponent
  ): boolean {

    if (!component.hasUnsavedChanges) {
      return true;
    }

    return window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
  }
}