import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceComentario {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  crearComentario(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/comentarios`, data);
  }
  getComentariosByLocalId(localId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comentarios/local/${localId}`);
  }
  actualizarComentario(id: number | string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/comentarios/${id}`, data);
  }

  eliminarComentario(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comentarios/${id}`);
  }
}
