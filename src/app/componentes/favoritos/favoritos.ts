import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import * as L from 'leaflet';

import { Buscador } from '../../herramientas/buscador/buscador'
import { LocalCercano, LocalFavorito } from '../../service/serviceApp/service';
import { DatosService } from '../../service/serviceApp/service';


const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


@Component({
  imports: [ CommonModule, FormsModule, RouterLink],
  selector: 'app-favoritos',
  styleUrl: './favoritos.css',
  templateUrl: './favoritos.html',
})
export class Favoritos {
  private router = inject(Router);
  private datosService = inject(DatosService);
  private cdr = inject(ChangeDetectorRef);

  get userId(): number {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuarioData = JSON.parse(usuarioStr);
      return Number(usuarioData.id) || 0;
    }
    return 0;
  }
  public localesFav: LocalFavorito[] = [];

  
  // Coordenadas predeterminadas (por si el usuario deniega la geolocalización)
  public latitud: number = -34.6037;
  public longitud: number = -58.3816;

  // Mapa individual expandido por tarjeta ("Ver más")
  public localExpandidoId: number | null = null;
  private miniMap?: L.Map;


  ngOnInit(): void {
    this.buscarFavoritos();
  }

  private buscarFavoritos(): void {
    this.datosService.favoritosPorUsuario(this.userId).subscribe({
      next: (locales) => {
        this.localesFav = [...locales.favoritos];
        this.cdr.detectChanges();

        console.log('Favoritos obtenidos:', this.localesFav);
      },
      error: (error) => {
        console.error('Error al buscar favoritos:', error);
      }
    });
  }

  eliminar(localId: number): void {
    this.datosService.eliminarFavorito(this.userId, localId).subscribe({
      next: () => {
        console.log(`Favorito con ID ${localId} eliminado correctamente.`);
        this.localesFav = this.localesFav.filter(local => local.id !== localId);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Error al eliminar favorito con ID ${localId}:`, error);
      }
    });
  }

  /*
  // ⚡ Desplegar/Ocultar el mapa embebido de cada tarjeta ("Ver más")
  public toggleVerMas(local: LocalCercano): void {
    if (this.localExpandidoId === local.id) {
      this.localExpandidoId = null;
      if (this.miniMap) {
        this.miniMap.remove();
        this.miniMap = undefined;
      }
    } else {
      this.localExpandidoId = local.id;
      // Esperamos a que Angular renderice el contenedor del mini-mapa en el DOM
      setTimeout(() => {
        this.inicializarMiniMapa(local);
      }, 150);
    }
  }

  private inicializarMiniMapa(local: LocalCercano): void {
    const containerId = `mini-map-${local.id}`;
    const element = document.getElementById(containerId);
    if (!element) return;

    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = undefined;
    }

    // 1. Convertir explicitamente las coordenadas a número por si vienen como string o undefined de MySQL
    const localLat = Number(local.latitud);
    const localLng = Number(local.longitud);
    const userLat = Number(this.latitud);
    const userLng = Number(this.longitud);

    // Validación para evitar el error "Invalid LatLng object: (NaN, NaN)"
    if (isNaN(localLat) || isNaN(localLng) || isNaN(userLat) || isNaN(userLng)) {
      console.error('Coordenadas inválidas para el mini mapa:', { localLat, localLng, userLat, userLng });
      return;
    }

    // Punto medio entre el usuario y el local
    const midLat = (userLat + localLat) / 2;
    const midLng = (userLng + localLng) / 2;

    // 2. Inicializar el mini-mapa
    this.miniMap = L.map(containerId, { zoomControl: false }).setView([midLat, midLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.miniMap);

    // Marcador del usuario
    L.marker([userLat, userLng], { icon: userIcon }).addTo(this.miniMap);

    // Marcador del local
    const imagen = local.imagen_principal || '';
    L.marker([localLat, localLng], {
      icon: crearLocalIconLarge(imagen)
    }).addTo(this.miniMap);

    // Ajustar encuadre para ver ambos puntos
    const bounds = L.latLngBounds([
      [userLat, userLng],
      [localLat, localLng]
    ]);
    this.miniMap.fitBounds(bounds, { padding: [30, 30] });

    // 3. Forzar a Leaflet a recalcular el tamaño del contenedor recién renderizado
    setTimeout(() => {
      if (this.miniMap) {
        this.miniMap.invalidateSize();
      }
    }, 100);
  }
  */
}
