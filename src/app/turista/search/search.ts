import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatosService } from '../../service/serviceApp/service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-search',
  styleUrl: './search.css',
  templateUrl: './search.html',
})
export class Search implements OnInit {
  public lugares: any[] = [];
  public categoriasDisponibles: any[] = [];

  // Variables para el sistema de filtros
  public lugaresFiltrados: any[] = [];
  public categoriasSeleccionadas: Set<string> = new Set();
  public puntuacionMinima: number | null = null;

  public cargando: boolean = true;
  public error: string = '';

  public paginaActual: number = 1;
  public itemsPorPagina: number = 12;
  public totalPaginas: number = 1;

  private cdr = inject(ChangeDetectorRef);

  public busqueda: string = '';

  constructor(private apiService: DatosService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.cargarlugares();
  }

  cargarlugares(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      lugares: this.apiService.getLugares(),
      categorias: this.apiService.getCategorias(),
    }).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.categoriasDisponibles = Array.isArray(respuesta.categorias) ? respuesta.categorias : [];

        this.lugares = (Array.isArray(respuesta.lugares) ? respuesta.lugares : []).map((lugar: any) => {
          const categoriaEncontrada = this.categoriasDisponibles.find(
            (cat: any) => String(cat.id) === String(lugar.categoria_id),
          );
          const categoriaNombre =
            lugar.categoria || (categoriaEncontrada ? categoriaEncontrada.nombre : 'Sin categoría');

          return {
            ...lugar,
            imagen_principal: lugar.imagen_principal || 'assets/placeholder.jpg',
            categoria: categoriaNombre,
            tipoServicioRegistrado: lugar.tipo_servicio || lugar.tipo || categoriaNombre,
            promedio_calificacion: Number(lugar.promedio_calificacion) || 0,
            total_resenas: Number(lugar.total_resenas) || 0,
          };
        });

        this.lugaresFiltrados = [...this.lugares];

        this.route.queryParams.subscribe((params) => {
          this.categoriasSeleccionadas.clear();

          const categoriaUrl = params['categoria'];
          if (categoriaUrl) {
            const catPorId = this.categoriasDisponibles.find(
              (cat: any) => String(cat.id) === String(categoriaUrl),
            );
            const nombreCategoria = catPorId ? catPorId.nombre : String(categoriaUrl);
            this.categoriasSeleccionadas.add(this.normalizarTexto(nombreCategoria));
          }

          const textoBusqueda = params['q'];
          if (typeof textoBusqueda === 'string') {
            this.busqueda = textoBusqueda;
          }

          this.paginaActual = 1;
          this.aplicarFiltros();
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'No se pudieron cargar los datos';
        console.error('Error:', err);
        this.cdr.detectChanges();
      },
    });
  }

  // Selección excluyente de categoría (arranca vacío, al elegir otra reemplaza la anterior)
  toggleCategoria(categoria: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const clave = this.normalizarTexto(categoria);

    this.categoriasSeleccionadas.clear();

    if (isChecked) {
      this.categoriasSeleccionadas.add(clave);
    }

    this.paginaActual = 1;
    this.aplicarFiltros();
    this.cdr.detectChanges();
  }

  estaCategoriaSeleccionada(categoria: string): boolean {
    return this.categoriasSeleccionadas.has(this.normalizarTexto(categoria));
  }

  // Selección excluyente de puntuación mínima
  togglePuntuacion(minimo: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.puntuacionMinima = isChecked ? minimo : null;

    this.paginaActual = 1;
    this.aplicarFiltros();
    this.cdr.detectChanges();
  }

  estaPuntuacionSeleccionada(minimo: number): boolean {
    return this.puntuacionMinima === minimo;
  }

  aplicarFiltros(): void {
    let filtradosTemp = [...this.lugares];

    // 1. Filtro por texto
    if (this.busqueda && this.busqueda.trim() !== '') {
      const termino = this.normalizarTexto(this.busqueda);
      filtradosTemp = filtradosTemp.filter((lugar) =>
        this.normalizarTexto(lugar.nombre).includes(termino) ||
        this.normalizarTexto(lugar.descripcion).includes(termino) ||
        this.normalizarTexto(lugar.categoria).includes(termino),
      );
    }

    // 2. Filtro por categoría seleccionada
    if (this.categoriasSeleccionadas.size > 0) {
      filtradosTemp = filtradosTemp.filter((lugar) =>
        this.categoriasSeleccionadas.has(this.normalizarTexto(lugar.categoria)),
      );
    }

    // 3. Filtro por puntuación mínima
    if (this.puntuacionMinima !== null) {
      filtradosTemp = filtradosTemp.filter(
        (lugar) =>
          Number(lugar.total_resenas) > 0 &&
          Number(lugar.promedio_calificacion) >= this.puntuacionMinima!,
      );
    }

    this.lugaresFiltrados = filtradosTemp;
    this.totalPaginas = Math.max(1, Math.ceil(this.lugaresFiltrados.length / this.itemsPorPagina));
    this.cdr.detectChanges();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private normalizarTexto(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
  get hayFiltrosActivos(): boolean {
  return (
    Boolean(this.busqueda && this.busqueda.trim() !== '') ||
    this.categoriasSeleccionadas.size > 0 ||
    this.puntuacionMinima !== null
  );
}

limpiarFiltros(): void {
  
  this.categoriasSeleccionadas.clear();
  this.puntuacionMinima = null;
  this.paginaActual = 1;
  this.aplicarFiltros();
  this.cdr.detectChanges();
}
}