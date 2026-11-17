import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Usuario {
  id: number;
  rol_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  foto_perfil: string | null;
  created_at: string;
}
@Injectable({
  providedIn: 'root'
})
export class ServicePerfil {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/usuarios';
  private authApiUrl = 'http://localhost:3000/api/auth';

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  obtenerMiPerfil(): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(`${this.authApiUrl}/me`);
  }

  actualizarPerfil(datos: { nombre: string; apellido: string; telefono: string | null; foto_perfil?: string }): Observable<{ mensaje: string; usuario: Usuario }> {
    return this.http.patch<{ mensaje: string; usuario: Usuario }>(`${this.authApiUrl}/me`, datos);
  }
}
