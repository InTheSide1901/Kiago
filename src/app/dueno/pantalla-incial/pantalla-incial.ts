import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarDueno } from '../navbar-dueno/navbar-dueno';
import { ServiceFormularioDueno } from '../../dueno/services/service-dashboard/service-dashboard';
import { AuthService } from '../../service/authService/auth-service'; // Asegurate de que la ruta sea correcta

@Component({
  selector: 'app-pantalla-incial',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarDueno],
  styleUrl: './pantalla-incial.css',
  templateUrl: './pantalla-incial.html',
})
export class PantallaIncial implements OnInit {
  private localService = inject(ServiceFormularioDueno);
  private authService = inject(AuthService);
  private router = inject(Router);

  nombreUsuario = signal<string>('OWNER');
  metricas = signal({ total: 0, aprobados: 0, pendientes: 0, rechazados: 0 });
  cargando = signal<boolean>(true);

  ngOnInit(): void {
    // Obtenemos el nombre del usuario logueado para el saludo
    const usuario = this.authService.getUsuario();
    if (usuario && usuario.nombre) {
      this.nombreUsuario.set(usuario.nombre.toUpperCase());
    }
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.cargando.set(true);
    this.localService.getMetricasDashboard().subscribe({
      next: (data) => {
        this.metricas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar métricas del dashboard:', err);
        this.cargando.set(false);
      }
    });
  }

  // Redirige a la pantalla de la grilla de locales aplicando el filtro
  filtrarLocales(estado: string): void {
    this.router.navigate(['/mis-locales'], { queryParams: { filtro: estado } });
  }

  // Función original que pediste conservar
  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}