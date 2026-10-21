import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudLocal } from './solicitud-local.model';

@Injectable({
  providedIn: 'root'
})


export class Service {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/admin/solicitudes'; // Ajustá según tu puerto/URL

  // Obtener solicitudes por estado (por defecto 'pendiente')
  getSolicitudes(estado: string = 'pendiente'): Observable<SolicitudLocal[]> {
    return this.http.get<SolicitudLocal[]>(`${this.apiUrl}?estado=${estado}`);
  }

  // Aprobar solicitud (el backend creará el usuario dueño y enviará las credenciales)
  aprobarSolicitud(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/aprobar`, {});
  }

  // Rechazar solicitud
  rechazarSolicitud(id: number, motivo_rechazo?: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/rechazar`, { motivo_rechazo });
  }
}
