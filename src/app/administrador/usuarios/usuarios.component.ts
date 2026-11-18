import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminUsersService } from '../core/services/admin-users.service';
import { EndpointPendingCardComponent } from '../shared/endpoint-pending-card.component';

@Component({
  selector: 'app-admin-usuarios',
  imports: [EndpointPendingCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div class="max-w-7xl mx-auto">

        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Usuarios</p>
            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Gestión de usuarios</h1>
            <p class="text-slate-500 font-medium text-sm md:text-base">
              Directorio, accesos y verificación de propietarios.
            </p>
          </div>
        </header>

        @if (!users.endpointDisponible) {
          <app-endpoint-pending-card
            titulo="Muy pronto"
            mensaje="Estamos preparando esta sección. Acá vas a poder ver todos los dueños con sus locales, sus datos de contacto y el estado de sus publicaciones." />
        }
      </div>
    </div>
  `,
})
export class UsuariosComponent {
  protected readonly users = inject(AdminUsersService);
}
