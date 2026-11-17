import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatosService } from '../../service/serviceApp/service';
import { Comentario } from '../comentario/comentario';
import { AuthService } from '../../service/authService/auth-service';

@Component({
  imports: [CommonModule, Comentario],
  selector: 'app-local-detalle',
  styleUrl: './local-detalle.css',
  templateUrl: './local-detalle.html',
})
export class LocalDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private datosService = inject(DatosService);
  private location = inject(Location);

  // Variables originales (Signals)
  local = signal<any>(null);
  cargando = signal<boolean>(true);
  categoriaId = signal<number | null>(null);

  // Variables de tu compañero para favoritos y menú
  esFavorito = false;
  menuAbierto = false;
  mostrarModalAgendamiento = false;
  fechaVisita = '';
  fechaMinimaVisita = '';
  guardandoAgendamiento = false;
  errorAgendamiento = '';
  mensajeAgendamiento = '';
  get userId(): number {
  const usuarioStr = localStorage.getItem('usuario');
  if (usuarioStr) {
    const usuarioData = JSON.parse(usuarioStr);
    return usuarioData.id || 0;
  }
  return 0;
}
  localId = Number(this.route.snapshot.paramMap.get('id'));
  public authService = inject(AuthService);
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const catId = Number(params.get('categoriaId'));
      
      if (catId) this.categoriaId.set(catId);

      if (id) {
        this.localId = id; // Aseguramos que se actualice si cambia la ruta
        this.cargarLocal(id);
        this.consultarEstadoFavorito(id);
      }
    });
  }

  cargarLocal(id: number) {
    this.cargando.set(true);
    this.datosService.getLocalById(id).subscribe({
      next: (data) => {
        this.local.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener detalle del local:', err);
        this.cargando.set(false);
      }
    });
  }

  private consultarEstadoFavorito(id: number): void {
    if (!this.userId || !id) return;

    this.datosService.consultarFavorito(this.userId, id)
      .subscribe({
        next: (respuesta) => {
          this.esFavorito = respuesta.esFavorito;
        },
        error: (error) => {
          console.error('Error al consultar favorito:', error);
        }
      });
  }

  alternarFavorito(): void {
    this.menuAbierto = false;

    if (!this.userId) {
      console.error('Usuario no logueado');
      return;
    }

    if (this.esFavorito) {
      this.datosService.eliminarFavorito(this.userId, this.localId)
        .subscribe({
          next: (respuesta) => {
            this.esFavorito = false;
          },
          error: (error) => console.error('Error al eliminar favorito:', error)
        });
    } else {
      this.datosService.agregarFavorito(this.userId, this.localId)
        .subscribe({
          next: (respuesta) => {
            this.esFavorito = true;
          },
          error: (error) => console.error('Error al agregar favorito:', error)
        });
    }
  }

  seleccionarOpcion(opcion: string): void {
    this.menuAbierto = false;
    switch (opcion) {
      case 'agendar':        
        this.abrirModalAgendamiento();
        break;
      case 'reportar':
        break;
    }
  }

  abrirModalAgendamiento(): void {
    if (!this.authService.currentUser() || !this.localId) return;

    this.fechaMinimaVisita = this.obtenerFechaLocal();
    this.fechaVisita = this.fechaMinimaVisita;
    this.errorAgendamiento = '';
    this.mensajeAgendamiento = '';
    this.mostrarModalAgendamiento = true;
  }

  capturarFechaVisita(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaVisita = input.value;
    this.errorAgendamiento = '';
  }

  cancelarAgendamiento(): void {
    if (this.guardandoAgendamiento) return;

    this.mostrarModalAgendamiento = false;
    this.fechaVisita = '';
    this.errorAgendamiento = '';
  }

  confirmarAgendamiento(): void {
    if (!this.fechaVisita || !this.localId || this.guardandoAgendamiento) return;

    this.guardandoAgendamiento = true;
    this.errorAgendamiento = '';
    this.mensajeAgendamiento = '';

    this.http.post<{ mensaje: string; agenda_id: number }>(
      'http://localhost:3000/api/agenda',
      {
        local_id: this.localId,
        fecha_visita: this.fechaVisita
      }
    ).subscribe({
      next: () => {
        this.guardandoAgendamiento = false;
        this.mostrarModalAgendamiento = false;
        this.fechaVisita = '';
        this.mensajeAgendamiento = '¡Visita agendada con éxito!';
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.guardandoAgendamiento = false;
        this.errorAgendamiento = error.status === 409
          ? 'Ya tienes este lugar agendado para esa fecha.'
          : error.status === 401
            ? 'Tu sesión venció. Inicia sesión nuevamente.'
            : error.error?.mensaje || 'No se pudo agendar la visita. Intenta nuevamente.';
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  cerrarMensajeAgendamiento(): void {
    this.mensajeAgendamiento = '';
  }

  private obtenerFechaLocal(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }

  volver() {
    this.location.back();
  }
}
