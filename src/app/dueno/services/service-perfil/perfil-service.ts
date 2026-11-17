import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilDueñoService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Ajusta tu puerto/URL base

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  actualizarDatos(datos: { nombre: string; apellido: string; email: string; telefono: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil/datos`, datos, { headers: this.getHeaders() });
  }

  // Renombrado a actualizarContrasena para que coincida con el componente
  actualizarContrasena(payload: { passActual: string; passNueva: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil/password`, payload, { headers: this.getHeaders() });
  }

  obtenerPerfil(): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }
}