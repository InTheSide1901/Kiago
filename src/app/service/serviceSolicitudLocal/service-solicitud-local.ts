import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class ServiceSolicitudLocal {
private apiUrl = 'http://localhost:3000/api/solicitudes_locales'; 

  constructor(private http: HttpClient) {}

  enviarSolicitud(datosLocal: any): Observable<any> {
    // 1. Recuperamos el token donde lo tengas guardado (ajusta 'token' si usas otro nombre)
    const token = localStorage.getItem('token'); 

    // 2. Configuramos las cabeceras HTTP para incluir el Authorization: Bearer
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 3. Enviamos la petición incluyendo los headers
    return this.http.post(this.apiUrl, datosLocal, { headers });
  }
}
