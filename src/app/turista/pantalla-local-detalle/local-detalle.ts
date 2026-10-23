import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatosService } from '../../service/serviceApp/service';
import { Comentario } from '../comentario/comentario';

@Component({
  imports: [CommonModule, Comentario],
  selector: 'app-local-detalle',
  styleUrl: './local-detalle.css',
  templateUrl: './local-detalle.html',
})
export class LocalDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private datosService = inject(DatosService);
  private location = inject(Location);

  // Variables originales (Signals)
  local = signal<any>(null);
  cargando = signal<boolean>(true);
  categoriaId = signal<number | null>(null);

  // Variables de tu compañero para favoritos y menú
  esFavorito = false;
  menuAbierto = false;
  get userId(): number {
  const usuarioStr = localStorage.getItem('usuario');
  if (usuarioStr) {
    const usuarioData = JSON.parse(usuarioStr);
    return usuarioData.id || 0;
  }
  return 0;
}
  localId = Number(this.route.snapshot.paramMap.get('id'));

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
        break;
      case 'reportar':
        break;
    }
  }

  volver() {
    this.location.back();
  }
}