import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FiltroEstado, LugarAdmin } from '../core/models/lugar-admin.model';
import { LugaresAdminService } from '../core/services/lugares-admin.service';
import { LugarDetalleModalComponent } from '../shared/lugar-detalle-modal.component';

@Component({
  selector: 'app-admin-todos-lugares',
  imports: [DatePipe, LugarDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div class="max-w-7xl mx-auto">

        <!-- Encabezado -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Establecimientos</p>
            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Todos los lugares</h1>
            <p class="text-slate-500 font-medium text-sm md:text-base">
              Consultá el estado y la información de cada publicación.
            </p>
          </div>

          <button
            type="button"
            (click)="svc.cargar()"
            [disabled]="svc.isLoading()"
            class="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ svc.isLoading() ? 'Actualizando…' : 'Actualizar' }}
          </button>
        </header>

        @if (ownerId()) {
          <div class="bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl p-4 mb-6 text-sm font-medium">
            Mostrando locales del propietario #{{ ownerId() }}
          </div>
        }

        <!-- Filtros -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
            <input
              type="search"
              placeholder="Buscar por nombre, categoría o correo…"
              aria-label="Buscar lugar"
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
              class="block w-full py-3.5 px-4 text-base text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent placeholder:text-gray-400 shadow-sm" />
          </div>

          <div class="flex flex-row flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="estado.set('TODOS')"
              class="w-full md:w-auto font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
              [class]="filtroClase('TODOS')">
              Todos
            </button>
            <button
              type="button"
              (click)="estado.set('APROBADO')"
              class="w-full md:w-auto font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
              [class]="filtroClase('APROBADO')">
              Aprobados
            </button>
            <button
              type="button"
              (click)="estado.set('PENDIENTE')"
              class="w-full md:w-auto font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
              [class]="filtroClase('PENDIENTE')">
              Pendientes
            </button>
            <button
              type="button"
              (click)="estado.set('RECHAZADO')"
              class="w-full md:w-auto font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
              [class]="filtroClase('RECHAZADO')">
              Rechazados
            </button>
          </div>
        </div>

        <!-- Avisos -->
        @if (svc.errorMessage(); as msg) {
          <div class="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 mb-6 text-sm font-medium" role="alert">{{ msg }}</div>
        }

        <!-- Contenido -->
        @if (svc.isLoading() && svc.lugares().length === 0) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500 font-medium">
            Cargando lugares…
          </div>
        } @else if (filtrados().length === 0 && !svc.errorMessage()) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500 font-medium">
            No se encontraron lugares con esos filtros.
          </div>
        } @else {
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Lugar</th>
                  <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Categoría</th>
                  <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ciudad</th>
                  <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Propietario</th>
                  <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                  <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Creado</th>
                  <th class="px-6 py-4"><span class="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (l of filtrados(); track l.origen + '-' + l.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-5">
                      <p class="font-semibold text-gray-900">{{ l.titulo }}</p>
                      <p class="text-xs text-gray-400 mt-1">#{{ l.origen === 'solicitud' ? 'S' : 'L' }}{{ l.id }}</p>
                    </td>
                    <td class="px-6 py-5 text-md text-gray-600">{{ l.categoria }}</td>
                    <td class="px-6 py-5 text-md text-gray-600">{{ l.ciudad }}</td>
                    <td class="px-6 py-5 text-md text-gray-600">{{ l.propietarioNombre }}</td>
                    <td class="px-6 py-5">
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-md font-semibold"
                        [class]="badgeClase(l.estado)">
                        {{ l.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-5 text-md text-gray-600">{{ l.creadoEn | date: 'dd/MM/yyyy' }}</td>
                    <td class="px-6 py-5 text-right">
                      <button
                        type="button"
                        (click)="abrirDetalle(l)"
                        [attr.aria-label]="'Ver detalle de ' + l.titulo"
                        class="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 5-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    @if (seleccionado(); as sel) {
      <app-lugar-detalle-modal [lugar]="sel" (cerrar)="cerrarDetalle()" />
    }
  `,
})
export class TodosLugaresComponent implements OnInit {
  protected readonly svc = inject(LugaresAdminService);

  /** Query param ?ownerId=:id (withComponentInputBinding). */
  readonly ownerId = input<string | undefined>();

  protected readonly busqueda = signal('');
  protected readonly estado = signal<FiltroEstado>('TODOS');
  protected readonly seleccionado = signal<LugarAdmin | null>(null);

  protected readonly filtrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const estado = this.estado();
    const owner = this.ownerId();

    return this.svc.lugares().filter((lugar) => {
      const coincideEstado = estado === 'TODOS' || lugar.estado === estado;
      const coincideOwner = !owner || String(lugar.propietarioId) === owner;
      const coincideTexto =
        termino.length === 0 ||
        lugar.titulo.toLowerCase().includes(termino) ||
        lugar.categoria.toLowerCase().includes(termino) ||
        lugar.email.toLowerCase().includes(termino);

      return coincideEstado && coincideOwner && coincideTexto;
    });
  });

  ngOnInit(): void {
    this.svc.cargar();
  }

  protected filtroClase(estado: FiltroEstado): string {
    const activo = this.estado() === estado;
    if (!activo) return 'bg-gray-50 hover:bg-gray-100 text-slate-500 border border-gray-200';

    switch (estado) {
      case 'APROBADO': return 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100';
      case 'PENDIENTE': return 'bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100';
      case 'RECHAZADO': return 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100';
      default: return 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100';
    }
  }

  protected badgeClase(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'bg-emerald-100 text-emerald-600';
      case 'PENDIENTE': return 'bg-amber-100 text-amber-600';
      default: return 'bg-rose-100 text-rose-600';
    }
  }

  protected abrirDetalle(lugar: LugarAdmin): void {
    this.seleccionado.set(lugar);

    // Los locales aprobados se completan con el detalle real y su dueño.
    this.svc.obtenerDetalle(lugar).subscribe({
      next: (detalle) => this.seleccionado.set(detalle),
    });
  }

  protected cerrarDetalle(): void {
    this.seleccionado.set(null);
  }
}
