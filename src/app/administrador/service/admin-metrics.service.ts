import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalificacionResumen {
  lugarId: number;
  titulo: string;
  comentarios: number;
  estrellas: number;
}

export interface LugarPopularItem {
  lugarId: number;
  titulo: string;
  categoria: string;
  comentarios: number;
  promedioCalificacion: number;
}

export interface ActividadAdminItem {
  id: number;
  estado: 'aprobado' | 'rechazado' | string;
  descripcion: string;
  lugarTitulo: string;
  creadoEn: string;
}

export interface AdminDashboardData {
  trafico: {
    turistasRegistrados: number;
    duenosRegistrados: number;
    totalLocales: number;
    totalComentarios: number;
    mejorCalificado: CalificacionResumen | null;
    peorCalificado: CalificacionResumen | null;
  };
  lugaresPopulares: LugarPopularItem[];
  actividad: ActividadAdminItem[];
}

@Injectable({ providedIn: 'root' })
export class AdminMetricsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/estadisticas/admin';

  obtenerEstadisticas(): Observable<AdminDashboardData> {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('jwt') ||
      '';

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<AdminDashboardData>(this.apiUrl, { headers });
  }
}