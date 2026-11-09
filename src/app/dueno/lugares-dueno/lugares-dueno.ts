import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


import { NavbarDueno } from '../navbar-dueno/navbar-dueno';
import { AuthService } from '../../service/authService/auth-service'; // Asegurate de que la ruta sea correcta
import { ServiceSolicitudes } from '../services/service-solicitudes/service-solicitudes/service-solicitudes';

@Component({
  imports: [CommonModule, NavbarDueno, FormsModule, RouterLink],
  standalone: true,
  selector: 'app-lugares-dueno',
  styleUrl: './lugares-dueno.css',
  templateUrl: './lugares-dueno.html',
})
export class LugaresDueno implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  serviceSolicitudes = inject(ServiceSolicitudes);

  nombreUsuario = signal<string>('OWNER');

  public busqueda: string = '';
  locales: any[] = [];

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('usuario') || 'null');
    const userID = user?.id;
    const filtro = 'todos';
    this.serviceSolicitudes.getLugaresFiltrados(userID, filtro).subscribe((data) => {
      console.log('Datos recibidos del servicio:', data);
      this.locales = data;
      console.log('Datos pasados:', this.locales);
    });
  }

  realizarBusqueda() { }

  filtro() { }
}
