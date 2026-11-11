
import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

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
    path: 'admin/errors',
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./features/admin/errors/errors')
        .then(m => m.ErrorsComponent)
  },
  {
    path: '',
    redirectTo: 'attributes',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/page-not-found/page-not-found')
        .then(m => m.PageNotFoundComponent)
  }
];
