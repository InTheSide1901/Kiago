import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar-dueno',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './navbar-dueno.css',
  templateUrl: './navbar-dueno.html',
})
export class NavbarDueno {
  public readonly authService = inject(AuthService);
  public readonly menuAbierto = signal(false);

  // Enlaces adaptados exactamente a tus rutas de Dueño
  protected readonly items: NavItem[] = [
    { label: 'Panel Principal', path: '/panel-dueno' },
    { label: 'Mis Lugares', path: '/panel-dueno/lugares' },
    { label: 'Registrar Local', path: '/panel-dueno/formulario-dueno' },
    { label: 'Mi Perfil', path: '/panel-dueno/perfil' }
  ];

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected onLogout(): void {
    this.cerrarMenu();
    this.authService.logout();
  }
}