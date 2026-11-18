import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service';

interface NavItem {
  label: string;
  path: string;
}

/** Navbar del admin, con el mismo diseño que NavbarDueno. */
@Component({
  selector: 'app-admin-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .nav-link.active {
      color: #34d399;
      background-color: rgb(255 255 255 / 0.06);
      font-weight: 600;
    }
  `,
  template: `
    <nav class="bg-slate-900 text-white shadow-md sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo de la app (el mismo texto que usa el dueño) + navegación -->
          <div class="flex items-center space-x-6">
            <a routerLink="/admin/pendientes" (click)="cerrarMenu()" class="text-xl font-bold tracking-wide text-white hover:text-emerald-400 transition">
              Mi App KIAGO
            </a>

            <div class="hidden lg:flex items-center space-x-1">
              @for (item of items; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  class="nav-link px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition">
                  {{ item.label }}
                </a>
              }
            </div>
          </div>

          <!-- Estado de autenticación -->
          <div class="hidden lg:flex items-center space-x-3">
            @if (authService.currentUser(); as usuario) {
              <span class="text-sm font-medium text-gray-200">
                Hola, <strong class="text-emerald-400">{{ usuario.nombre }}</strong>
              </span>
              <button
                (click)="cerrarSesion()"
                class="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-3 py-1.5 rounded-md transition shadow-sm">
                Cerrar Sesión
              </button>
            }
          </div>

          <!-- Botón menú móvil -->
          <button
            type="button"
            (click)="alternarMenu()"
            class="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Abrir menú"
            [attr.aria-expanded]="menuAbierto()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>
      </div>

      <!-- Menú móvil -->
      @if (menuAbierto()) {
        <div class="lg:hidden border-t border-slate-800 px-4 py-3 space-y-1">
          @for (item of items; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              (click)="cerrarMenu()"
              class="nav-link block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition">
              {{ item.label }}
            </a>
          }
          <button
            (click)="cerrarSesion()"
            class="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-3 py-2 rounded-md transition shadow-sm">
            Cerrar Sesión
          </button>
        </div>
      }
    </nav>
  `,
})
export class AdminHeaderComponent {
  protected readonly authService = inject(AuthService);

  protected readonly menuAbierto = signal(false);

  protected readonly items: NavItem[] = [
    { label: 'Pendientes', path: '/admin/pendientes' },
    { label: 'Todos los lugares', path: '/admin/lugares' },
    { label: 'Usuarios', path: '/admin/usuarios' },
    { label: 'Estadísticas', path: '/admin/estadisticas' },
    { label: 'Control de calidad', path: '/admin/reportes' },
  ];

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected cerrarSesion(): void {
    this.cerrarMenu();
    this.authService.logout();
  }
}
