import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ServiceSolicitudes {
  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) { }
  getLugaresFiltrados(userID: number, filtro: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/locales/mis-locales/filtrados/${userID}/${filtro}`);
  }
}
