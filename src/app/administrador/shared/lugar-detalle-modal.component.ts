import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LugarAdmin } from '../core/models/lugar-admin.model';

@Component({
  selector: 'app-lugar-detalle-modal',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let l = lugar();
    <div class="fixed inset-0 bg-slate-900/60 z-50 flex items-end md:items-center justify-center" (click)="cerrar.emit()">
      <div
        class="bg-white w-full md:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-2xl md:rounded-2xl shadow-xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Detalle de ' + l.titulo"
        (click)="$event.stopPropagation()">

        <header class="sticky top-0 bg-white flex items-start justify-between gap-4 p-5 md:p-6 border-b border-slate-100">
          <div>
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-900">{{ l.titulo }}</h2>
            <div class="flex items-center gap-2 mt-2">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                [class]="badgeClase(l.estado)">
                {{ l.estado }}
              </span>
              <span class="text-xs text-slate-400 font-medium">
                {{ l.origen === 'solicitud' ? 'Solicitud de alta' : 'Local publicado' }}
              </span>
            </div>
          </div>

          <button
            type="button"
            (click)="cerrar.emit()"
            aria-label="Cerrar"
            class="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div class="p-5 md:p-6 space-y-5">
          @if (l.imagen) {
            <img class="w-full max-h-64 object-cover rounded-xl border border-slate-100" [src]="l.imagen" [alt]="'Foto de ' + l.titulo" loading="lazy" />
          }

          @if (l.descripcion) {
            <p class="text-slate-600">{{ l.descripcion }}</p>
          }

          <dl class="text-sm divide-y divide-slate-100">
            <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Categoría</dt><dd class="text-slate-700 text-right">{{ l.categoria }}</dd></div>

            @if (l.direccion && l.direccion !== '—') {
              <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Dirección</dt><dd class="text-slate-700 text-right">{{ l.direccion }}</dd></div>
            }
            @if (l.ciudad && l.ciudad !== '—') {
              <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Ciudad</dt><dd class="text-slate-700 text-right">{{ l.ciudad }}</dd></div>
            }
            @if (l.email) {
              <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Email</dt><dd class="text-slate-700 text-right break-all">{{ l.email }}</dd></div>
            }
            @if (l.telefono) {
              <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Teléfono</dt><dd class="text-slate-700 text-right">{{ l.telefono }}</dd></div>
            }
            @if (l.sitioWeb) {
              <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Sitio web</dt><dd class="text-slate-700 text-right break-all">{{ l.sitioWeb }}</dd></div>
            }

            <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Propietario</dt><dd class="text-slate-700 text-right">{{ l.propietarioNombre }}</dd></div>

            @if (l.creadoEn) {
              <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Creado</dt><dd class="text-slate-700 text-right">{{ l.creadoEn | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
            }
            @if (l.motivoRechazo) {
              <div class="py-3 flex justify-between gap-6"><dt class="text-slate-400 font-medium shrink-0">Motivo de rechazo</dt><dd class="text-rose-600 text-right">{{ l.motivoRechazo }}</dd></div>
            }
          </dl>
        </div>
      </div>
    </div>
  `,
})
export class LugarDetalleModalComponent {
  readonly lugar = input.required<LugarAdmin>();
  readonly cerrar = output<void>();

  protected badgeClase(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'bg-emerald-100 text-emerald-600';
      case 'PENDIENTE': return 'bg-amber-100 text-amber-600';
      default: return 'bg-rose-100 text-rose-600';
    }
  }

  @HostListener('document:keydown.escape')
  protected alPresionarEscape(): void {
    this.cerrar.emit();
  }
}
