import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface Usuario {
  id?: number;
  rol_id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  foto_perfil?: string;
}
export interface AuthResponse {
    token: string;
    usuario: Usuario;
}
@Injectable({
  providedIn: 'root'
})
export class ServiceAuth {
    private apiUrl = 'http://localhost:3000/api/auth'; // Ajusta la URL de tu backend API

  // Estado reactivo accesible desde cualquier componente
  public currentUser = signal<Usuario | null>(this.obtenerUsuarioStorage());

  constructor(private http: HttpClient, private router: Router) {}

  private obtenerUsuarioStorage(): Usuario | null {
    const userStr = localStorage.getItem('usuario');
    return userStr ? JSON.parse(userStr) : null;
  }

  login(credenciales: { email: string; password_hash: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  registrar(datosUsuario: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, datosUsuario).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('usuario');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('id', JSON.stringify(res.usuario.id));
    localStorage.setItem('usuario', JSON.stringify(res.usuario));
    this.currentUser.set(res.usuario);
  }
}
