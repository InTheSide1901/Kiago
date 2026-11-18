import { Injectable } from '@angular/core';
import { OwnerSummary } from '../models/owner-summary.model';

/**
 * Servicio de usuarios-dueños.
 * El backend actual NO expone un endpoint para listar usuarios:
 * no se inventa ninguna URL.
 */
@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  // TODO: conectar cuando el backend exponga GET /api/usuarios (listado).
  // private readonly http = inject(HttpClient);
  //
  // listarDuenos(): Observable<OwnerSummary[]> {
  //   return this.http.get<OwnerSummary[]>(`${API_CONFIG.baseUrl}/<endpoint-pendiente>`);
  // }

  readonly endpointDisponible = false;

  /** Placeholder tipado para facilitar la futura conexión. */
  readonly duenos: readonly OwnerSummary[] = [];
}
