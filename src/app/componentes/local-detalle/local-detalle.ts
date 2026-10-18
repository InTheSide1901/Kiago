import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatosService } from '../../service/serviceApp/service';
import { Comentario } from '../comentario/comentario'; // Adjusta la ruta de importación si es necesario

@Component({
  imports: [CommonModule, RouterLink, Comentario], // Agregado Comentario aquí
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

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const catId = Number(params.get('categoriaId'));
      
      if (catId) this.categoriaId.set(catId);

      if (id) {
        this.cargarLocal(id);
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
}