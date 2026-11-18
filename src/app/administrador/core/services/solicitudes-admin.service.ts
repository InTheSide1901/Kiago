import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { ADMIN_API } from '../config/admin-api.config';
import { mapSolicitud } from '../mappers/admin.mappers';
import { LugarAdmin } from '../models/lugar-admin.model';
import {
  AprobarSolicitudResponse,
  CredencialesGeneradas,
  SolicitudAdminRaw,
} from '../models/solicitud-admin.model';

/**
 * Solicitudes de alta de locales enviadas por turistas y enviadas por dueños.
 * Consume los endpoints reales del backend compartido.
 */
@Injectable({ providedIn: 'root' })
export class SolicitudesAdminService {
  private readonly http = inject(HttpClient);

  private readonly _solicitudes = signal<LugarAdmin[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);

  readonly solicitudes = this._solicitudes.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly total = computed(() => this._solicitudes().length);

  cargar(): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);

    this.http
      .get<SolicitudAdminRaw[]>(`${ADMIN_API.baseUrl}${ADMIN_API.paths.solicitudesPendientes}`)
      .subscribe({
        next: (data) => {
          this._solicitudes.set(data.map(mapSolicitud));
          this._isLoading.set(false);
        },
        error: () => {
          this._errorMessage.set('No pudimos cargar las solicitudes pendientes. Intentá nuevamente.');
          this._isLoading.set(false);
        },
      });
  }

  /** Devuelve las credenciales generadas si el solicitante era turista. */
  aprobar(id: number): Observable<CredencialesGeneradas | null> {
    return this.http
      .post<AprobarSolicitudResponse>(`${ADMIN_API.baseUrl}${ADMIN_API.paths.aprobarSolicitud(id)}`, {})
      .pipe(
        tap(() => this.quitar(id)),
        map((respuesta) => respuesta.credenciales ?? null),
      );
  }

  rechazar(id: number, motivo: string): Observable<unknown> {
    return this.http
      .put(`${ADMIN_API.baseUrl}${ADMIN_API.paths.rechazarSolicitud(id)}`, { motivo })
      .pipe(tap(() => this.quitar(id)));
  }

  reportarError(mensaje: string | null): void {
    this._errorMessage.set(mensaje);
  }

  private quitar(id: number): void {
    this._solicitudes.update((lista) => lista.filter((solicitud) => solicitud.id !== id));
  }
}
