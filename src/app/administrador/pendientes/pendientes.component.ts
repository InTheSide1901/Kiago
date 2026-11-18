import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SolicitudesAdminService } from '../core/services/solicitudes-admin.service';
import { CredencialesGeneradas } from '../core/models/solicitud-admin.model';

@Component({
  selector: 'app-admin-pendientes',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div class="max-w-7xl mx-auto">

        <!-- Encabezado -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Solicitudes</p>
            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Administración de locales</h1>
            <p class="text-slate-500 font-medium text-sm md:text-base">
              Revisá y gestioná las solicitudes de nuevos comercios.
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

        <!-- Avisos -->
        @if (svc.errorMessage(); as msg) {
          <div class="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 mb-6 text-sm font-medium" role="alert">{{ msg }}</div>
        }
        @if (mensaje(); as msg) {
          <div class="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl p-4 mb-6 text-sm font-medium" role="status">{{ msg }}</div>
        }

        <!-- Contenido -->
        @if (svc.isLoading() && svc.solicitudes().length === 0) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500 font-medium">
            Cargando solicitudes…
          </div>
        } @else if (svc.solicitudes().length === 0 && !svc.errorMessage()) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <div class="w-12 h-12 mx-auto bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4 text-xl">🎉</div>
            <h2 class="text-lg font-bold text-slate-900 mb-1">No hay solicitudes pendientes</h2>
            <p class="text-slate-500 text-sm">Cuando un usuario envíe un nuevo local para validar, aparecerá acá.</p>
          </div>
        } @else {
          <p class="text-slate-500 font-medium text-sm mb-4">
            <strong class="text-slate-800">{{ svc.total() }}</strong>
            {{ svc.total() === 1 ? 'solicitud pendiente' : 'solicitudes pendientes' }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (s of svc.solicitudes(); track s.id) {
              <article class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3">
                @if (s.imagen) {
                  <img class="w-full h-40 object-cover rounded-xl" [src]="s.imagen" [alt]="'Foto de ' + s.titulo" loading="lazy" />
                }

                <div class="flex justify-between items-start gap-3">
                  <h2 class="text-lg font-bold text-slate-900">{{ s.titulo }}</h2>
                  <span class="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full shrink-0">{{ s.categoria }}</span>
                </div>

                @if (s.descripcion) {
                  <p class="text-sm text-slate-500">{{ s.descripcion }}</p>
                }

                <dl class="text-sm divide-y divide-slate-100">
                  <div class="py-2 flex justify-between gap-4"><dt class="text-slate-400 font-medium">Solicitante</dt><dd class="text-slate-700 text-right">{{ s.propietarioNombre }}</dd></div>
                  @if (s.email) {
                    <div class="py-2 flex justify-between gap-4"><dt class="text-slate-400 font-medium">Correo</dt><dd class="text-slate-700 text-right break-all">{{ s.email }}</dd></div>
                  }
                  @if (s.telefono) {
                    <div class="py-2 flex justify-between gap-4"><dt class="text-slate-400 font-medium">Teléfono</dt><dd class="text-slate-700 text-right">{{ s.telefono }}</dd></div>
                  }
                  @if (s.direccion !== '—') {
                    <div class="py-2 flex justify-between gap-4"><dt class="text-slate-400 font-medium">Dirección</dt><dd class="text-slate-700 text-right">{{ s.direccion }}</dd></div>
                  }
                  @if (s.ciudad !== '—') {
                    <div class="py-2 flex justify-between gap-4"><dt class="text-slate-400 font-medium">Ciudad</dt><dd class="text-slate-700 text-right">{{ s.ciudad }}</dd></div>
                  }
                  @if (s.creadoEn) {
                    <div class="py-2 flex justify-between gap-4"><dt class="text-slate-400 font-medium">Enviada</dt><dd class="text-slate-700 text-right">{{ s.creadoEn | date: 'dd/MM/yyyy HH:mm' }}</dd></div>
                  }
                </dl>

                <div class="flex gap-3 mt-auto pt-2">
                  <button
                    type="button"
                    (click)="rechazar(s.id)"
                    [disabled]="procesando() === s.id"
                    class="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-colors">
                    Rechazar
                  </button>
                  <button
                    type="button"
                    (click)="aprobar(s.id)"
                    [disabled]="procesando() === s.id"
                    class="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-colors">
                    {{ procesando() === s.id ? 'Procesando…' : 'Aprobar' }}
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </div>

    <!-- Modal de credenciales -->
    @if (credenciales(); as c) {
      <div class="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4" (click)="cerrarCredenciales()">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-6" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-extrabold text-slate-900 mb-2">Local aprobado</h2>
          <p class="text-slate-500 text-sm">Se creó una cuenta de dueño. Compartí estas credenciales con el solicitante:</p>

          <dl class="text-sm divide-y divide-slate-100 my-4">
            <div class="py-3 flex justify-between gap-4"><dt class="text-slate-400 font-medium">Correo</dt><dd class="text-slate-700 text-right break-all">{{ c.email }}</dd></div>
            <div class="py-3 flex justify-between gap-4">
              <dt class="text-slate-400 font-medium">Contraseña temporal</dt>
              <dd class="text-right"><code class="bg-slate-100 rounded px-2 py-0.5 font-bold text-slate-800">{{ c.password_temporal }}</code></dd>
            </div>
          </dl>

          <button
            type="button"
            (click)="cerrarCredenciales()"
            class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-colors">
            Entendido
          </button>
        </div>
      </div>
    }
  `,
})
export class PendientesComponent implements OnInit {
  protected readonly svc = inject(SolicitudesAdminService);

  protected readonly procesando = signal<number | null>(null);
  protected readonly credenciales = signal<CredencialesGeneradas | null>(null);
  protected readonly mensaje = signal<string | null>(null);

  ngOnInit(): void {
    this.svc.cargar();
  }

  protected aprobar(id: number): void {
    if (!confirm('¿Aprobar esta solicitud y publicar el local?')) return;

    this.procesando.set(id);
    this.mensaje.set(null);
    this.svc.reportarError(null);

    this.svc.aprobar(id).subscribe({
      next: (credenciales) => {
        this.procesando.set(null);
        if (credenciales) {
          this.credenciales.set(credenciales);
        } else {
          this.mensaje.set('Solicitud aprobada. El local se asignó a la cuenta del dueño existente.');
        }
      },
      error: () => {
        this.procesando.set(null);
        this.svc.reportarError('No se pudo aprobar la solicitud. Intentá nuevamente.');
      },
    });
  }

  protected rechazar(id: number): void {
    const motivo = prompt('Motivo del rechazo (se le mostrará al solicitante):');
    if (motivo === null) return;

    this.procesando.set(id);
    this.mensaje.set(null);
    this.svc.reportarError(null);

    this.svc.rechazar(id, motivo.trim() || 'No cumple con los requisitos.').subscribe({
      next: () => {
        this.procesando.set(null);
        this.mensaje.set('Solicitud rechazada. Se notificará el motivo al solicitante.');
      },
      error: () => {
        this.procesando.set(null);
        this.svc.reportarError('No se pudo rechazar la solicitud. Intentá nuevamente.');
      },
    });
  }

  protected cerrarCredenciales(): void {
    this.credenciales.set(null);
  }
}
