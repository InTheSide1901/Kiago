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
  if (confirm('¿Estás seguro de aprobar este local?')) {
    this.solicitudesService.aprobarSolicitud(id).subscribe({
      next: (respuesta) => {
        // Verificamos si el backend generó credenciales (usuario nuevo)
        if (respuesta.credenciales && respuesta.credenciales.password_temporal) {
          const email = respuesta.credenciales.email;
          const password = respuesta.credenciales.password_temporal;
          alert(`¡Local aprobado con éxito!\n\nSe creó una nueva cuenta de dueño.\nCorreo: ${email}\nContraseña temporal: ${password}`);
        } else {
          // Si el usuario ya existía en la DB
          alert('¡Local aprobado con éxito!\n\nEl local fue asignado a la cuenta del dueño existente.');
        }

        // Quitamos la solicitud de la lista visualmente
        this.solicitudes.update(actuales => actuales.filter(s => s.id !== id));
      },
      error: (err) => {
        console.error('Error al aprobar solicitud:', err);
        alert('Ocurrió un error al aprobar la solicitud.');
      }
    });
  }
}
//agregue nuevo codigo para aprobar solicitudes en caso de que el mismo dueño envie varias para su propio local

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