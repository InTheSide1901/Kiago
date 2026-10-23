import { Component, AfterViewInit, ElementRef, ViewChild, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import * as L from 'leaflet';
import { LocalesService, LocalCercano } from '../../service/serviceApp/service';

// Icono distinto para TU UBICACIÓN (Fijo, rojo)
const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Función para generar el HTML del Pin Verde Pequeño en reposo
function crearLocalIconSmall(): L.DivIcon {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-4 h-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-md"></span>
      </div>
    `,
    className: '', // Dejar vacío para que Leaflet no aplique estilos heredados
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
}

// Función para generar el HTML del Pin Grande con la imagen del local al presionarlo (Activo)
function crearLocalIconLarge(imagenUrl: string): L.DivIcon {
  // Imagen por defecto si viene vacía de MySQL
  const img = imagenUrl || 'https://via.placeholder.com/150';

  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center group transition-transform duration-300 scale-110">
        <!-- Contenedor circular con borde e imagen -->
        <div class="w-12 h-12 rounded-full border-4 border-emerald-500 bg-white shadow-xl overflow-hidden flex items-center justify-center">
          <img src="${img}" class="w-full h-full object-cover" alt="Local" />
        </div>
        <!-- Puntero triangular hacia abajo -->
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-500 -mt-[1px]"></div>
      </div>
    `,
    className: '',
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -50]
  });
}

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-prueba',
  styleUrl: './prueba.css',
  templateUrl: './prueba.html',
})
export class Prueba implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;

  private localesService = inject(LocalesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Coordenadas predeterminadas (por si el usuario deniega la geolocalización)
  public latitud: number = -34.6037;
  public longitud: number = -58.3816;
  public radioMetros: number = 1000; // ⚡ Por defecto 1000 metros (1 km)

  public locales: LocalCercano[] = [];
  public buscando: boolean = false;
  public busquedaRealizada: boolean = false;

  // Mapa principal
  private map!: L.Map;
  private userMarker?: L.Marker;
  private searchCircle?: L.Circle;
  private localesMarkers: L.Marker[] = [];
  private selectedMarker?: L.Marker;

  // Mapa individual expandido por tarjeta ("Ver más")
  public localExpandidoId: number | null = null;
  private miniMap?: L.Map;

  ngAfterViewInit(): void {
    this.initMap();
    // ⚡ Solicitar geolocalización automáticamente al iniciar la vista
    this.solicitarUbicacionInicial();
  }

  ngOnDestroy(): void {
    if (this.miniMap) this.miniMap.remove();
    if (this.map) this.map.remove();
  }

  private initMap(): void {
  this.map = L.map(this.mapElement.nativeElement).setView([this.latitud, this.longitud], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(this.map);

  // ⚡ NUEVO: Evento al hacer clic en cualquier parte del mapa
  this.map.on('click', (e: L.LeafletMouseEvent) => {
    // 1. Actualizamos latitud y longitud con las coordenadas del clic
    this.latitud = e.latlng.lat;
    this.longitud = e.latlng.lng;

    // 2. Buscamos los locales cercanos desde ese nuevo punto
    this.buscarLocalesCercanos();
  });

  this.actualizarUbicacionEnMapa();
}

  public solicitarUbicacionInicial(): void {
    this.buscando = true;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitud = pos.coords.latitude;
          this.longitud = pos.coords.longitude;
          this.buscarLocalesCercanos();
        },
        (error) => {
          console.warn('Permiso de geolocalización denegado o no disponible:', error.message);
          // Si rechaza el permiso, busca con las coordenadas por defecto asignadas
          this.buscarLocalesCercanos();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      this.buscarLocalesCercanos();
    }
  }

  public buscarLocalesCercanos(): void {
    if (!this.map) return;
    this.buscando = true;
    this.busquedaRealizada = false;
    this.localExpandidoId = null;

    this.map.setView([this.latitud, this.longitud], this.calcularZoom(this.radioMetros));
    this.actualizarUbicacionEnMapa();

    this.localesService.getLocalesCercanos(this.latitud, this.longitud, this.radioMetros)
      .pipe(
        finalize(() => {          
          this.buscando = false;
          this.busquedaRealizada = true;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: (data: LocalCercano[]) => {          
          this.locales = Array.isArray(data) ? data : [];
          this.limpiarMarcadoresAnteriores();

          this.locales.forEach((local) => {
            if (local.latitud && local.longitud) {
              const imagen = local.imagen_principal || '';
              const marker = L.marker([local.latitud, local.longitud], { icon: crearLocalIconSmall() })
                .addTo(this.map)
                .bindPopup(`
                  <div style="font-family: sans-serif; min-width: 140px;">
                    <h3 style="margin: 0; font-weight: bold; color: #1e293b; font-size: 13px;">${local.nombre}</h3>
                    <p style="margin: 2px 0; color: #64748b; font-size: 11px;">${local.calle || ''} ${local.altura || ''}</p>
                    <small style="color: #2563eb; font-weight: 600;">Distancia: ${local.distancia_metros}m</small>
                  </div>
                `);

              marker.on('click', () => {
                if (this.selectedMarker && this.selectedMarker !== marker) {
                  this.selectedMarker.setIcon(crearLocalIconSmall());
                }
                marker.setIcon(crearLocalIconLarge(imagen));
                this.selectedMarker = marker;

                const popup = marker.getPopup();
                if (popup) {
                  popup.options.offset = L.point(0, -10);
                  popup.update();
                }
              });

              marker.on('popupclose', () => {
                marker.setIcon(crearLocalIconSmall());
                if (this.selectedMarker === marker) this.selectedMarker = undefined;
              });

              this.localesMarkers.push(marker);
            }
          });
        },
        error: (err) => {
          console.error('Error al obtener locales desde Node/MySQL:', err);
          this.locales = [];
        }
      });
  }

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

  

  private actualizarUbicacionEnMapa(): void {
    const coords: L.LatLngExpression = [this.latitud, this.longitud];

    if (this.userMarker) this.map.removeLayer(this.userMarker);
    if (this.searchCircle) this.map.removeLayer(this.searchCircle);

    this.userMarker = L.marker(coords, { icon: userIcon, zIndexOffset: 1000 })
      .addTo(this.map)
      .bindPopup('Tu ubicación seleccionada')
      .openPopup();

    this.searchCircle = L.circle(coords, {
      color: '#3B82F6',
      fillColor: '#93C5FD',
      fillOpacity: 0.2,
      radius: this.radioMetros
    }).addTo(this.map);
  }

  private limpiarMarcadoresAnteriores(): void {
    this.localesMarkers.forEach((marker) => this.map.removeLayer(marker));
    this.localesMarkers = [];
    this.selectedMarker = undefined;
  }

  private calcularZoom(radioMetros: number): number {
    if (radioMetros <= 500) return 16;
    if (radioMetros <= 1500) return 15;
    if (radioMetros <= 3000) return 14;
    return 13;
  }
}