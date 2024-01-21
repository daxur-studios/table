import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'table-demo',
  },
  {
    path: 'table-demo',
    loadComponent: () =>
      import('./pages/table-demo/table-demo.component').then(
        (m) => m.TableDemoComponent
      ),
  },
];
