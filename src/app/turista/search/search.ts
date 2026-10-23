import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { CommonModule } from '@angular/common';
import { DatosService } from '../../service/serviceApp/service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [Header, Footer, CommonModule, FormsModule, RouterLink],
  selector: 'app-search',
  styleUrl: './search.css',
  templateUrl: './search.html',
})
export class Search implements OnInit {
  public lugares: any[] = [];

  // Variables nuevas para el sistema de filtros
  public lugaresFiltrados: any[] = [];
  public categoriasSeleccionadas: Set<string> = new Set();

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
    forkJoin({
      lugares: this.apiService.getLugares(),
      // imagenes: this.apiService.getImages(),
      categorias: this.apiService.getCategorias(),
    }).subscribe({
      next: (respuesta) => {
        this.cargando = false;

        this.lugares = respuesta.lugares.map((lugar: any) => {
          // const imagenEncontrada = respuesta.imagenes.find((img: any) => img.local_id === lugar.id);
          const categoriaEncontrada = respuesta.categorias.find(
            (cat: any) => cat.id === lugar.categoria_id,
          );

          return {
            ...lugar,
            // imagenUrl: imagenEncontrada ? imagenEncontrada.url_imagen : 'images/nodisponible.jpg',
            categoria: categoriaEncontrada ? categoriaEncontrada.nombre : 'Categoría desconocida',
          };
        });

        // Al iniciar, mostramos todos los lugares por defecto
        this.lugaresFiltrados = [...this.lugares];

        // --- NUEVA SECCIÓN: Leer la URL y aplicar filtros ---
        this.route.queryParams.subscribe((params) => {
          // 1. Capturar categoría (si viene desde los íconos del Home)
          const categoriaUrl = params['categoria'];
          if (categoriaUrl) {
            this.categoriasSeleccionadas.add(categoriaUrl);
          }

          // 2. Capturar texto de búsqueda (si viene desde el buscador del Home)
          const textoBusqueda = params['q'];
          if (textoBusqueda) {
            this.busqueda = textoBusqueda;
          }

          // 3. Aplicar los filtros con los datos obtenidos
          this.aplicarFiltros();
        });
        // ----------------------------------------------------

        console.log('Lugares con imágenes procesadas:', this.lugares);
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

  //Lógica de Filtros

  toggleCategoria(categoria: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.categoriasSeleccionadas.add(categoria);
    } else {
      this.categoriasSeleccionadas.delete(categoria);
    }

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
  let filtradosTemp = this.lugares;

  // 1. Filtro por el texto del buscador
  if (this.busqueda && this.busqueda.trim() !== '') {
    const termino = this.busqueda.toLowerCase();
    filtradosTemp = filtradosTemp.filter(lugar => 
      lugar.nombre.toLowerCase().includes(termino) ||
      lugar.descripcion.toLowerCase().includes(termino) ||
      lugar.categoria.toLowerCase().includes(termino)
    );
  } else {
    // Si no hay término de búsqueda, mostramos todos los lugares
    
  }

  // 2. Filtro por los checkboxes de categoría
  if (this.categoriasSeleccionadas.size > 0) {
    filtradosTemp = filtradosTemp.filter(lugar =>
      this.categoriasSeleccionadas.has(lugar.categoria)
    );
  }

  this.lugaresFiltrados = filtradosTemp;
}

  // -------------------------

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
