import { Routes } from '@angular/router';

import { AttributeListComponent } from './pages/attribute-list/attribute-list';
import { AddAttributeComponent } from './pages/add-attribute/add-attribute';
import { EditAttributeComponent } from './pages/edit-attribute/edit-attribute';

export const ATTRIBUTE_ROUTES: Routes = [
  {
    path: '',
    component: AttributeListComponent
  },
  {
    path: 'add',
    component: AddAttributeComponent
  },
  {
    path: ':id/edit',
    component: EditAttributeComponent
  }
];