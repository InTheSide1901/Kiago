import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminMetricsService } from '../core/services/admin-metrics.service';
import { EstadoReporte, QualityReport, TipoReporte } from '../core/models/quality-report.model';

type FiltroReporte = 'TODOS' | EstadoReporte;

@Component({
  selector: 'app-admin-control-calidad',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div class="max-w-7xl mx-auto">

        <!-- Encabezado -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reportes</p>
            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Flags y reportes</h1>
            <p class="text-slate-500 font-medium text-sm md:text-base">
              Reportes de datos incorrectos enviados por turistas.
            </p>
          </div>
          <span class="bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
            Datos de demostración
          </span>
        </header>

        <!-- Filtros por estado -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Filtrar por estado</p>
          <div class="flex flex-row flex-wrap items-center gap-2">
            @for (opcion of filtros; track opcion) {
              <button
                type="button"
                (click)="filtro.set(opcion)"
                class="w-full md:w-auto font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors"
                [class]="filtroClase(opcion)">
                {{ etiquetaFiltro(opcion) }}
              </button>
            }
          </div>
        </div>

        <!-- Listado de reportes -->
        @if (filtrados().length === 0) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500 font-medium">
            No hay reportes con ese estado.
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            @for (r of filtrados(); track r.id) {
              <article class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" [class]="fondoTipo(r.tipo)">
                  {{ iconoTipo(r.tipo) }}
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-900">{{ etiquetaTipo(r.tipo) }}</p>
                      <p class="text-xs text-slate-400 mt-0.5 truncate">{{ r.lugarTitulo }}</p>
                    </div>
                    <span class="text-xs font-bold px-3 py-1 rounded-full shrink-0" [class]="badgeEstado(r.estado)">
                      {{ etiquetaEstado(r.estado) }}
                    </span>
                  </div>

                  <p class="text-sm text-slate-500 mt-3">“{{ r.comentario }}”</p>

                  <div class="flex items-center justify-between gap-3 mt-4 text-xs text-slate-400">
                    <span>Reportado por <strong class="text-slate-600">{{ r.reportadoPor }}</strong></span>
                    <span>{{ r.creadoEn | date: 'dd/MM/yyyy · HH:mm' }}</span>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ControlCalidadComponent {
  private readonly metrics = inject(AdminMetricsService);

  protected readonly reportes = this.metrics.reportes;
  protected readonly filtros: FiltroReporte[] = ['TODOS', 'ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'];
  protected readonly filtro = signal<FiltroReporte>('TODOS');

  protected readonly filtrados = computed<QualityReport[]>(() => {
    const estado = this.filtro();
    if (estado === 'TODOS') return this.reportes;
    return this.reportes.filter((reporte) => reporte.estado === estado);
  });

  private readonly etiquetasTipo: Record<TipoReporte, string> = {
    HORARIO_DESACTUALIZADO: 'Horario desactualizado',
    LUGAR_CERRADO: 'Lugar cerrado',
    DATOS_ERRONEOS: 'Datos erróneos',
    FALTAN_IMAGENES: 'Faltan imágenes',
    MAL_TRATO: 'Mal trato',
    CAMBIO_DUENO: 'Cambio de dueño',
  };

  private readonly iconosTipo: Record<TipoReporte, string> = {
    HORARIO_DESACTUALIZADO: '🕒',
    LUGAR_CERRADO: '🔒',
    DATOS_ERRONEOS: '❗',
    FALTAN_IMAGENES: '📷',
    MAL_TRATO: '😠',
    CAMBIO_DUENO: '🔄',
  };

  protected etiquetaTipo(tipo: TipoReporte): string {
    return this.etiquetasTipo[tipo];
  }

  protected iconoTipo(tipo: TipoReporte): string {
    return this.iconosTipo[tipo];
  }

  /** Fondo suave del ícono según el tipo de reporte. */
  protected fondoTipo(tipo: TipoReporte): string {
    switch (tipo) {
      case 'HORARIO_DESACTUALIZADO': return 'bg-amber-50';
      case 'LUGAR_CERRADO': return 'bg-rose-50';
      case 'DATOS_ERRONEOS': return 'bg-indigo-50';
      case 'FALTAN_IMAGENES': return 'bg-emerald-50';
      case 'MAL_TRATO': return 'bg-rose-50';
      default: return 'bg-slate-50';
    }
  }

  protected etiquetaEstado(estado: EstadoReporte): string {
    switch (estado) {
      case 'ABIERTO': return 'Abierto';
      case 'EN_REVISION': return 'En revisión';
      case 'RESUELTO': return 'Resuelto';
      default: return 'Descartado';
    }
  }

  protected badgeEstado(estado: EstadoReporte): string {
    switch (estado) {
      case 'ABIERTO': return 'bg-rose-100 text-rose-600';
      case 'EN_REVISION': return 'bg-amber-100 text-amber-600';
      case 'RESUELTO': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  }

  protected etiquetaFiltro(filtro: FiltroReporte): string {
    return filtro === 'TODOS' ? 'Todos' : this.etiquetaEstado(filtro as EstadoReporte);
  }

  protected filtroClase(filtro: FiltroReporte): string {
    if (this.filtro() !== filtro) return 'bg-gray-50 hover:bg-gray-100 text-slate-500 border border-gray-200';

    switch (filtro) {
      case 'ABIERTO': return 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100';
      case 'EN_REVISION': return 'bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100';
      case 'RESUELTO': return 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100';
      case 'DESCARTADO': return 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200';
      default: return 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100';
    }
  }
}
