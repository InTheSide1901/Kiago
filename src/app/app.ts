import { Component, inject } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Header } from './turista/header/header';
import { Footer } from './turista/footer/footer';
import { AuthService } from './service/authService/auth-service'; // Asegúrate de que esta ruta sea correcta

@Component({
  imports: [RouterOutlet, CommonModule, Header, Footer, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {

  private router = inject(Router);
  public authService = inject(AuthService); // <-- Inyectamos el AuthService
  
  // Variable que controla si se ven el header y el footer
  mostrarLayout: boolean = true;

  constructor() {
    // Escuchamos los cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      const usuario = this.authService.currentUser();

      // REGLA ABSOLUTA POR ROL: 
      // Si el usuario logueado es Dueño (rol_id = 2) o Admin (rol_id = 1),
      // NUNCA debemos mostrar el header/footer global de turista, pase lo que pase en la URL.
      if (usuario && (usuario.rol_id === 1 || usuario.rol_id === 2)) {
        this.mostrarLayout = false;
        return; // Salimos de inmediato para que no evalúe las URLs de abajo
      }

      // Para turistas o usuarios no logueados, ocultamos el layout global en estas rutas específicas
      const esAdminODuenoOAuth = 
        url.includes('/admin') || 
        url.startsWith('/panel-dueno') || 
        url.includes('/login') || 
        url.includes('/register');

      this.mostrarLayout = !esAdminODuenoOAuth;
    });
  }

  protected initializeFlowbite(): void {
    setTimeout(() => initFlowbite());
  }
}