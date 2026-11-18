import { Routes } from '@angular/router';

/**
 * Rutas del panel de administración.
 * Se cuelgan de `/admin` en `app.routes.ts` y comparten el `adminGuard`.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pendientes' },
      {
        path: 'pendientes',
        title: 'Pendientes · KIAGO Admin',
        loadComponent: () =>
          import('./pendientes/pendientes.component').then((m) => m.PendientesComponent),
      },
      {
        path: 'lugares',
        title: 'Todos los lugares · KIAGO Admin',
        loadComponent: () =>
          import('./todos-lugares/todos-lugares.component').then((m) => m.TodosLugaresComponent),
      },
      {
        path: 'usuarios',
        title: 'Usuarios · KIAGO Admin',
        loadComponent: () =>
          import('./usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'estadisticas',
        title: 'Estadísticas · KIAGO Admin',
        loadComponent: () =>
          import('./estadisticas/estadisticas.component').then((m) => m.EstadisticasComponent),
      },
      {
        path: 'reportes',
        title: 'Reportes · KIAGO Admin',
        loadComponent: () =>
          import('./reportes/control-calidad.component').then((m) => m.ControlCalidadComponent),
      },
      { path: '**', redirectTo: 'pendientes' },
    ],
  },
];
