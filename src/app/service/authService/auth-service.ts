import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';

  // 1. Método privado para obtener y parsear el usuario del storage
  private getUsuarioFromStorage(): any | null {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }

  // 2. Signal inicializado con el valor recuperado del localStorage
  currentUser = signal<any>(this.getUsuarioFromStorage());

  register(datos: { nombre: string; apellido: string; email: string; password: string; telefono?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, datos).pipe(
      tap(res => {
        if (res.token && res.usuario) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          // Actualizamos la Signal en tiempo real
          this.currentUser.set(res.usuario);
        }
      })
    );
  }

  login(credenciales: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(res => {
        if (res.token && res.usuario) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          // Actualizamos la Signal en tiempo real
          this.currentUser.set(res.usuario);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    // Notificamos a la Signal que ya no hay usuario logueado
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): any | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}