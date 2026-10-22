import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../../componentes/solicitud-local/solicitud-local'; // O donde definas la interfaz
@Injectable({
  providedIn: 'root'
})
export class ServiceSolicitudLocal {
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  // --- Métodos para el formulario de envío (Usuario Normal) ---

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  enviarSolicitud(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitudes`, payload);
  }

  // --- Métodos para el panel de administración (Administrador) ---

  getSolicitudesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/solicitudes/pendientes`);
  }

  aprobarSolicitud(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitudes/${id}/aprobar`, {});
  }

  rechazarSolicitud(id: number, motivo: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/solicitudes/${id}/rechazar`, { motivo });
  }
  getMisSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-solicitudes`);
  }
}
