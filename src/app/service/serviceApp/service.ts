import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
}

export interface MiDato {
  id: number;
  nombre: string;
  imagen_principal: string;
}
export interface SolicitudLocal {
  id: number;
  usuario_id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  telefono: string;
  correo_electronico: string;
  sitio_web?: string;
  calle: string;
  altura: number;
  latitud: number;
  longitud: number;
  ciudad_id: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  motivo_rechazo?: string;
  created_at: string;
}

export interface LocalCercano {
  id: number;
  categoria_id?: number;
  nombre: string;
  descripcion?: string;
  telefono?: string;
  correo_electronico?: string;
  sitio_web?: string;
  categoria?: string;
  categoria_icono?: string;
  calle?: string;
  altura?: number;
  latitud: number;
  longitud: number;
  imagen_principal?: string;
  distancia_km: number;
  distancia_metros: number;
  promedio_calificacion?: number;
}
export interface LocalFavorito {
  id: number;
  usuario_id: number;
  categoria_id?: number;
  nombre: string;
  imagen_principal?: string;
}



@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/locales';

  getLocalesCercanos(lat: number, lng: number, radioMetros: number): Observable<LocalCercano[]> {
    return this.http.get<LocalCercano[]>(
      `${this.apiUrl}/cercanos?lat=${lat}&lng=${lng}&radio=${radioMetros}`
    );
  }
}



@Injectable({
  providedIn: 'root'
})
export class DatosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';


  getDatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/datos`);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  crearDato(nombre: string): Observable<MiDato> {
    return this.http.post<MiDato>(`${this.apiUrl}/datos`, { nombre });
  }

  actualizarDato(id: number, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/datos/${id}`, { nombre });
  }

  eliminarDato(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/datos/${id}`);
  }

  getLocalesPorCategoria(categoriaId: number): Observable<MiDato[]> {
    return this.http.get<MiDato[]>(`${this.apiUrl}/locales/categoria/${categoriaId}`);
  }

  getLocalById(id: number): Observable<MiDato> {
    return this.http.get<MiDato>(`${this.apiUrl}/locales/${id}`);
  }

  buscarLocales(termino: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locales/buscar`, {
      params: { q: termino }
    });
  }
  // ------------------favoritos------------------------
   agregarFavorito(userId: number, localId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favoritosAgregar`, { user_id: userId, local_id: localId });
  }

  eliminarFavorito(userId: number, localId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favoritosEliminar`, {
      body: { user_id: userId.toString(), local_id: localId.toString() }
    });
  }

  consultarFavorito( userId: number, localId: number): Observable<{ esFavorito: boolean }> {
    return this.http.get<{ esFavorito: boolean }>(
      `${this.apiUrl}/favoritos/${userId}/${localId}`
    );
  }

  favoritosPorUsuario(userId: number): Observable<{ favoritos: LocalFavorito[]}> {
    console.log('Consultando los favoritos del siguiente userId:', userId);
    return this.http.get<{ favoritos: LocalFavorito[]}>(`${this.apiUrl}/favoritos/${userId}`);
  }

  


}