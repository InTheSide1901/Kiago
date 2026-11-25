import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioAdminItem {
  id: number;
  rol_id: number;
  rol_nombre: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  foto_perfil: string | null;
  created_at: string;
  total_locales: number;
  total_resenas: number;
}

export interface DetalleUsuarioAdmin {
  locales: Array<{
    id: number;
    nombre: string;
    direccion: string;
    categoria: string;
    created_at: string;
  }>;
  solicitudes: Array<{
    id: number;
    nombre: string;
    estado: string;
    categoria: string;
    created_at: string;
    updated_at: string | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/admin/usuarios';

  private buildHeaders(): { headers?: HttpHeaders } {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('jwt') ||
      '';

    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  obtenerUsuarios(): Observable<{ usuarios: UsuarioAdminItem[] }> {
    return this.http.get<{ usuarios: UsuarioAdminItem[] }>(this.apiUrl, this.buildHeaders());
  }

  obtenerDetalleUsuario(id: number): Observable<DetalleUsuarioAdmin> {
    return this.http.get<DetalleUsuarioAdmin>(`${this.apiUrl}/${id}/detalle`, this.buildHeaders());
  }
}