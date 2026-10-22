import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <-- Importamos el Router
import { ServiceSolicitudLocal } from '../../service/serviceSolicitudLocal/service-solicitud-local';

@Component({
  imports: [CommonModule],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class InicioAdmin implements OnInit {
  // 1. Declaramos el estado usando Signals
  solicitudes = signal<any[]>([]);
  cargando = signal<boolean>(true);

  // Inyectamos el Router junto con tu servicio
  constructor(
    private solicitudesService: ServiceSolicitudLocal,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cargarPendientes(): void {
    this.cargando.set(true);
    this.solicitudesService.getSolicitudesPendientes().subscribe({
      next: (data) => {
        this.solicitudes.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pendientes', err);
        this.cargando.set(false);
      }
    });
  }

  aprobar(id: number): void {
    if (confirm('¿Estás seguro de aprobar este local? Se creará un nuevo usuario dueño.')) {
      this.solicitudesService.aprobarSolicitud(id).subscribe({
        next: (respuesta) => {
          const email = respuesta.credenciales.email;
          const password = respuesta.credenciales.password_temporal;

          alert(`¡Local aprobado con éxito!\n\nDatos para enviar al dueño:\nCorreo: ${email}\nContraseña temporal: ${password}`);
          this.solicitudes.update(actuales => actuales.filter(s => s.id !== id));
        },
        error: (err) => alert('Ocurrió un error al aprobar la solicitud.')
      });
    }
  }

  rechazar(id: number): void {
    const motivo = prompt('Ingresá el motivo del rechazo (se le mostrará al usuario):');
    
    if (motivo !== null) {
      this.solicitudesService.rechazarSolicitud(id, motivo).subscribe({
        next: () => {
          alert('Solicitud rechazada.');
          this.solicitudes.update(actuales => actuales.filter(s => s.id !== id));
        },
        error: (err) => alert('Ocurrió un error al rechazar la solicitud.')
      });
    }
  }

  // Nuevo método para cerrar sesión
  cerrarSesion(): void {
    // Limpiamos los datos del usuario del navegador
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Redirigimos a la pantalla de login
    this.router.navigate(['/login']);
  }
}