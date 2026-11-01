import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface Categoria {
  id: number;
  nombre: string;
  icono?: string;
}
@Injectable({
  providedIn: 'root'
})
export class ServiceFormularioDueno {
    private apiUrl = 'http://localhost:3000/api';
    constructor(private http: HttpClient) {}
    getMetricasDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/locales/metricas`);
  }
}
