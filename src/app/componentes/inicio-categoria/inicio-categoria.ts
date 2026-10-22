import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Buscador } from '../../herramientas/buscador/buscador'
// Importa desde la ruta correcta de tu servicio
import { DatosService, Categoria } from '../../service/serviceApp/service'; 
import { Prueba } from '../prueba/prueba';
import {Footer} from '../footer/footer'
import {Header} from '../header/header'

@Component({
  imports: [CommonModule, Buscador, Prueba],
  selector: 'app-inicio-categoria',
  styleUrl: './inicio-categoria.css',
  templateUrl: './inicio-categoria.html',
})
export class InicioCategoria implements OnInit {
  private categoriasService = inject(DatosService);
  private router = inject(Router);

  categorias = signal<Categoria[]>([]);
  cargando = signal<boolean>(true);

  private estilosMap: Record<number, string> = {
    1: 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',
    2: 'bg-gradient-to-br from-emerald-400 to-green-600 hover:from-emerald-500 hover:to-green-700',
    3: 'bg-gradient-to-br from-indigo-400 to-purple-600 hover:from-indigo-500 hover:to-purple-700',
    4: 'bg-gradient-to-br from-rose-400 to-red-600 hover:from-rose-500 hover:to-red-700',
    5: 'bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600'
  };

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriasService.getCategorias().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener categorías de la BD:', err);
        this.cargando.set(false);
      }
    });
  }

  obtenerEstiloPorId(id: number): string {
    return this.estilosMap[id] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  }

  seleccionarCategoria(id: number) {
    this.router.navigate(['/inicio/categoria', id]);
  }
}