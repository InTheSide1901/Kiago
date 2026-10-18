import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatosService, MiDato } from '../../service/serviceApp/service';


@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-inicio-categoria-detalle',
  styleUrl: './inicio-categoria-detalle.css',
  templateUrl: './inicio-categoria-detalle.html',
})
export class InicioCategoriaDetalle implements OnInit{
  private route = inject(ActivatedRoute);
  private datosService = inject(DatosService);

  locales = signal<MiDato[]>([]);
  cargando = signal<boolean>(true);
  categoriaId = signal<number | null>(null);

  ngOnInit() {
    // Escuchar cambios en los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.categoriaId.set(id);
        this.cargarLocales(id);
      }
    });
  }

  cargarLocales(id: number) {
    this.cargando.set(true);
    this.datosService.getLocalesPorCategoria(id).subscribe({
      next: (data) => {
        this.locales.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar locales de la categoría:', err);
        this.cargando.set(false);
      }
    });
  }
}
