import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


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
  route = inject(ActivatedRoute);
  serviceSolicitudes = inject(ServiceSolicitudes);

  public busqueda: string = '';
  locales = signal<any[]>([]);
  user: any = '';

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('usuario') || 'null');
    this.user = user?.id;

    this.route.queryParams.subscribe(params => {
      const filtro = params['filtro'] || 'todos';
      
      this.serviceSolicitudes.getLugaresFiltrados(this.user, filtro).subscribe((data) => {
        console.log('Datos recibidos:', data);
        this.locales.set(data);
      });
    });
  }

  realizarBusqueda() {
    this.serviceSolicitudes.getLugaresBusqueda(
      this.user,
      this.busqueda
    ).subscribe((data) => {
      this.locales.set(data);
    });
  }

  filtro(filtro: string) {
    this.serviceSolicitudes.getLugaresFiltrados(this.user, filtro).subscribe((data) => {
      console.log('Usuario ID:', this.user);
      this.locales.set(data);
    });
  }
}
