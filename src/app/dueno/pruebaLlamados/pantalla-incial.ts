

import { Router, RouterLink } from '@angular/router';
import { NavbarDueno } from '../navbar-dueno/navbar-dueno';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceSolicitudLocal } from '../../service/serviceSolicitudLocal/service-solicitud-local';
@Component({
  imports: [CommonModule, NavbarDueno],
  selector: 'app-pantalla-incial',
  styleUrl: './pantalla-incial.css',
  templateUrl: './pantalla-incial.html',
})
export class PantallaIncial implements OnInit{
  constructor(private router: Router) {}

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
  private localService = inject(ServiceSolicitudLocal);

  locales = signal<any[]>([]);
  cargando = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarLocales();
  }

  cargarLocales(): void {
    this.cargando.set(true);
    this.localService.getMisLocales().subscribe({
      next: (data) => {
        this.locales.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar mis locales:', err);
        this.cargando.set(false);
      }
    });
  }
}
