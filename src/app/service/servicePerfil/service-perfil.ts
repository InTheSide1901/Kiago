import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Usuario {
  id: number;
  rol_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  foto_perfil: string;
  created_at: string;
}
@Injectable({
  providedIn: 'root'
})
export class ServicePerfil {
    private http = inject(HttpClient);
  // Ajusta esta URL a la ruta real de tu backend Node.js
  private apiUrl = 'http://localhost:3000/api/usuarios'; 

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
}
