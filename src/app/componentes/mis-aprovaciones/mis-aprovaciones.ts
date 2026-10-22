import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceSolicitudLocal } from '../../service/serviceSolicitudLocal/service-solicitud-local';
@Component({
  imports: [CommonModule],
  selector: 'app-mis-aprovaciones',
  styleUrl: './mis-aprovaciones.css',
  templateUrl: './mis-aprovaciones.html',
})
export class MisAprovaciones implements OnInit{
  misSolicitudes = signal<any[]>([]);
  cargando = signal<boolean>(true);

  constructor(private solicitudesService: ServiceSolicitudLocal) {}

  ngOnInit(): void {
    this.solicitudesService.getMisSolicitudes().subscribe({
      next: (data) => {
        this.misSolicitudes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar mis solicitudes:', err);
        this.cargando.set(false);
      }
    });
  }
}
