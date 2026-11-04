
import { Routes } from '@angular/router';

import { AttributeListComponent } from './pages/attribute-list/attribute-list';
import { AddAttributeComponent } from './pages/add-attribute/add-attribute';
import { EditAttributeComponent } from './pages/edit-attribute/edit-attribute';

import { AuthGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UnsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

import { AttributeResolver } from './resolvers/attribute.resolver';

export const ATTRIBUTE_ROUTES: Routes = [
  {
    path: '',
    component: AttributeListComponent
  },
  {
    path: 'add',
    component: AddAttributeComponent,
    canActivate: [AuthGuard, roleGuard]
  },
  {
    path: ':id/edit',
    component: EditAttributeComponent,
    canActivate: [AuthGuard],
    canDeactivate: [UnsavedChangesGuard],
    resolve: {
      attribute: AttributeResolver
    }
  }
];
