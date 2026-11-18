import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from './admin-header.component';

/**
 * Contenedor del panel de administración.
 * Cada página trae su propio contenedor con el mismo diseño que usa el dueño.
 */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-admin-header />
    <main><router-outlet /></main>
  `,
})
export class AdminLayoutComponent {}
