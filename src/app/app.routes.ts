import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'attributes',
    loadChildren: () =>
      import('./features/attributes/attribute.routes')
        .then(m => m.ATTRIBUTE_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },
  {
    path: '',
    redirectTo: 'attributes',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/page-not-found/page-not-found')
        .then(m => m.PageNotFoundComponent)
  }
];