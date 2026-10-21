import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatosService } from '../../service/serviceApp/service';
import { Location } from '@angular/common';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-local-detalle',
  styleUrl: './local-detalle.css',
  templateUrl: './local-detalle.html',
})
export class LocalDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private datosService = inject(DatosService);

  local = signal<any>(null);
  cargando = signal<boolean>(true);
  categoriaId = signal<number | null>(null);

  esFavorito = false;
  userId = Number(localStorage.getItem('id'));
  localId = Number(this.route.snapshot.paramMap.get('id'));

  constructor(private location: Location) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const catId = Number(params.get('categoriaId'));

      console.log('localId:', this.localId);
      console.log('localId:', id);

      if (catId) this.categoriaId.set(catId);

      if (id) {
        this.cargarLocal(id);
        this.consultarEstadoFavorito(id);
      }
    })
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

  menuAbierto = false;

  seleccionarOpcion(opcion: string): void {
    this.menuAbierto = false;

    switch (opcion) {
      case 'favorito':
        console.log('Agregar a favoritos');
        break;

      case 'agendar':
        console.log('Agendar lugar');
        break;

      case 'reportar':
        console.log('Reportar lugar');
        break;
    }
  }

  private consultarEstadoFavorito(id: number): void {
    const usuarioId = this.userId;
    const localId = id; // Adaptar al nombre real de tu variable

    if (!usuarioId || !localId) return;

    this.datosService.consultarFavorito(usuarioId, localId)
      .subscribe({
        next: (respuesta) => {
          console.log('Respuesta de consultarFavorito:', respuesta.esFavorito);
          this.esFavorito = respuesta.esFavorito;
        },
        error: (error) => {
          console.error('Error al consultar favorito:', error);
        }
      });
  }

  alternarFavorito(): void {
    this.menuAbierto = false;

    if (this.esFavorito) {
      this.datosService.eliminarFavorito(this.userId, this.localId)
        .subscribe({
          next: (respuesta) => {
            console.log('Eliminado de favoritos:', respuesta);
            this.esFavorito = false;
          },
          error: (error) => {
            console.error('Error al eliminar favorito:', error);
          }
        });
    } else {
      this.datosService.agregarFavorito(this.userId, this.localId)
        .subscribe({
          next: (respuesta) => {
            console.log('Agregado a favoritos:', respuesta);
            this.esFavorito = true;
          },
          error: (error) => {
            console.error('Error al agregar favorito:', error);
          }
        });
    }
  }

  volver() {
    this.location.back();
  }
}
