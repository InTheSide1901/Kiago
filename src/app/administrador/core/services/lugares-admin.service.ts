import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ADMIN_API } from '../config/admin-api.config';
import { aplicarDetalle, mapLocal, mapSolicitud } from '../mappers/admin.mappers';
import { CategoriaRaw, LocalDetalleRaw, LocalRaw, UsuarioRaw } from '../models/catalogo.model';
import { LugarAdmin } from '../models/lugar-admin.model';
import { SolicitudAdminRaw } from '../models/solicitud-admin.model';

/** Tope de consultas de dueños por carga, para no saturar el backend. */
const MAX_PROPIETARIOS = 50;

/**
 * Catálogo unificado para el panel: locales aprobados (`/locales`) +
 * solicitudes pendientes (`/solicitudes/pendientes`).
 */
@Injectable({ providedIn: 'root' })
export class LugaresAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = ADMIN_API.baseUrl;

  private readonly _lugares = signal<LugarAdmin[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);

  readonly lugares = this._lugares.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();

  cargar(): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);

    forkJoin({
      locales: this.http.get<LocalRaw[]>(`${this.base}${ADMIN_API.paths.locales}`),
      pendientes: this.http.get<SolicitudAdminRaw[]>(
        `${this.base}${ADMIN_API.paths.solicitudesPendientes}`,
      ),
      categorias: this.http.get<CategoriaRaw[]>(`${this.base}${ADMIN_API.paths.categorias}`),
    })
      .pipe(
        switchMap(({ locales, pendientes, categorias }) =>
          forkJoin({
            detalles: this.cargarDetalles(categorias),
            propietarios: this.cargarPropietarios(locales),
          }).pipe(map(({ detalles, propietarios }) => ({ locales, pendientes, categorias, detalles, propietarios }))),
        ),
      )
      .subscribe({
        next: ({ locales, pendientes, categorias, detalles, propietarios }) => {
          const porCategoria = new Map<number, string>();
          categorias.forEach((categoria) => porCategoria.set(categoria.id, categoria.nombre));

          const lista: LugarAdmin[] = [
            ...pendientes.map(mapSolicitud),
            ...locales.map((local) =>
              mapLocal(
                local,
                porCategoria,
                detalles.get(local.id),
                propietarios.get(local.usuario_id),
              ),
            ),
          ];
          lista.sort((a, b) => fechaEnMs(b.creadoEn) - fechaEnMs(a.creadoEn));

          this._lugares.set(lista);
          this._isLoading.set(false);
        },
        error: () => {
          this._errorMessage.set('No pudimos cargar los lugares. Intentá nuevamente.');
          this._isLoading.set(false);
        },
      });
  }

  /**
   * Completa la información de un local aprobado con dirección, ciudad,
   * imagen y nombre del dueño. Las solicitudes ya vienen completas.
   */
  obtenerDetalle(lugar: LugarAdmin): Observable<LugarAdmin> {
    if (lugar.origen === 'solicitud') return of(lugar);

    return forkJoin({
      detalle: this.http.get<LocalDetalleRaw>(
        `${this.base}${ADMIN_API.paths.localDetalle(lugar.id)}`,
      ),
      usuario: this.http
        .get<UsuarioRaw>(`${this.base}${ADMIN_API.paths.usuario(lugar.propietarioId)}`)
        .pipe(catchError(() => of(null))),
    }).pipe(map(({ detalle, usuario }) => aplicarDetalle(lugar, detalle, usuario)));
  }

  /**
   * `/locales` solo trae columnas base. El endpoint por categoría devuelve el
   * local con su dirección, ciudad e imagen principal, así que se consulta una
   * vez por categoría y se arma un índice por id. Cada categoría es tolerante a
   * fallos: si una falla, el resto de los locales se muestra igual.
   */
  private cargarDetalles(categorias: readonly CategoriaRaw[]): Observable<Map<number, LocalDetalleRaw>> {
    if (categorias.length === 0) return of(new Map<number, LocalDetalleRaw>());

    return forkJoin(
      categorias.map((categoria) =>
        this.http
          .get<LocalDetalleRaw[]>(
            `${this.base}${ADMIN_API.paths.localesPorCategoria(categoria.id)}`,
          )
          .pipe(catchError(() => of([] as LocalDetalleRaw[]))),
      ),
    ).pipe(
      map((listas) => {
        const detallePorId = new Map<number, LocalDetalleRaw>();
        listas.flat().forEach((detalle) => {
          if (detalle?.id !== undefined && detalle?.id !== null) {
            detallePorId.set(detalle.id, detalle);
          }
        });
        return detallePorId;
      }),
    );
  }

  /** Resuelve el nombre del dueño de cada local para mostrarlo en la tabla. */
  private cargarPropietarios(locales: readonly LocalRaw[]): Observable<Map<number, string>> {
    const ids = [...new Set(locales.map((local) => local.usuario_id))]
      .filter((id) => id !== undefined && id !== null)
      .slice(0, MAX_PROPIETARIOS);

    if (ids.length === 0) return of(new Map<number, string>());

    return forkJoin(
      ids.map((id) =>
        this.http
          .get<UsuarioRaw>(`${this.base}${ADMIN_API.paths.usuario(id)}`)
          .pipe(catchError(() => of(null))),
      ),
    ).pipe(
      map((usuarios) => {
        const nombrePorId = new Map<number, string>();
        usuarios.forEach((usuario) => {
          if (!usuario) return;
          const nombre = `${(usuario.nombre ?? '').trim()} ${(usuario.apellido ?? '').trim()}`.trim();
          nombrePorId.set(usuario.id, nombre || `Dueño #${usuario.id}`);
        });
        return nombrePorId;
      }),
    );
  }
}

function fechaEnMs(valor: string): number {
  const fecha = new Date(valor).getTime();
  return Number.isNaN(fecha) ? 0 : fecha;
}
