import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminMetricsService } from '../core/services/admin-metrics.service';

@Component({
  selector: 'app-admin-estadisticas',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      <div class="max-w-7xl mx-auto">

        <!-- Encabezado -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resumen</p>
            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Estadísticas</h1>
            <p class="text-slate-500 font-medium text-sm md:text-base">
              Lugares populares, tráfico y actividad de la plataforma.
            </p>
          </div>
          <span class="bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
            Datos de demostración
          </span>
        </header>

        <!-- Métricas de tráfico -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400">Turistas registrados</p>
              <p class="text-2xl font-bold text-slate-800 leading-tight">{{ trafico.turistasRegistrados | number }}</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400">Dueños registrados</p>
              <p class="text-2xl font-bold text-slate-800 leading-tight">{{ trafico.duenosRegistrados | number }}</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400">Locales publicados</p>
              <p class="text-2xl font-bold text-slate-800 leading-tight">{{ trafico.totalLocales | number }}</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400">Comentarios publicados</p>
              <p class="text-2xl font-bold text-slate-800 leading-tight">{{ trafico.totalComentarios | number }}</p>
            </div>
          </div>

        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Lugares populares -->
          <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Lugares populares</p>
            <ol class="divide-y divide-slate-100">
              @for (lugar of dashboard.lugaresPopulares; track lugar.lugarId; let i = $index) {
                <li class="py-4 flex items-center gap-4">
                  <span class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl shrink-0">{{ medallas[i] }}</span>

                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-slate-900 truncate">{{ lugar.titulo }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ lugar.categoria }}</p>
                  </div>

                  <div class="text-right shrink-0">
                    <p class="text-sm font-bold text-slate-800 flex items-center justify-end gap-1">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 5-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      {{ lugar.visitas | number }}
                    </p>
                    <p class="text-xs text-slate-400 mt-0.5">💬 {{ lugar.comentarios }} comentarios</p>
                  </div>
                </li>
              }
            </ol>
          </div>

          <!-- Calificaciones -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Calificaciones</p>

            <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
              <p class="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Mejor calificado</p>
              <p class="font-semibold text-slate-900">{{ trafico.mejorCalificado?.titulo }}</p>
              <p class="text-amber-400 font-bold text-lg mt-1">{{ estrellas(trafico.mejorCalificado?.estrellas) }} {{ trafico.mejorCalificado?.estrellas }}</p>
            </div>

            <div class="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <p class="text-xs font-bold text-rose-600 uppercase tracking-wide mb-1">Peor calificado</p>
              <p class="font-semibold text-slate-900">{{ trafico.peorCalificado?.titulo }}</p>
              <p class="text-amber-400 font-bold text-lg mt-1">{{ estrellas(trafico.peorCalificado?.estrellas) }} {{ trafico.peorCalificado?.estrellas }}</p>
            </div>
          </div>

          <!-- Actividad reciente -->
          <div class="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Actividad reciente</p>
            <ul class="divide-y divide-slate-100">
              @for (evento of dashboard.actividad; track evento.id) {
                <li class="py-4 flex items-start gap-4">
                  <span class="w-2.5 h-2.5 mt-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <p class="text-sm text-slate-600 min-w-0 flex-1">
                    {{ evento.descripcion }}
                    @if (evento.lugarTitulo) {
                      <strong class="text-slate-900">· {{ evento.lugarTitulo }}</strong>
                    }
                  </p>
                  <span class="text-xs text-slate-400 shrink-0">{{ evento.creadoEn | date: 'dd/MM/yyyy · HH:mm' }}</span>
                </li>
              }
            </ul>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class EstadisticasComponent {
  protected readonly metrics = inject(AdminMetricsService);

  protected readonly dashboard = this.metrics.dashboard;
  protected readonly trafico = this.dashboard.trafico;

  protected readonly medallas = ['🥇', '🥈', '🥉'];

  protected estrellas(valor?: number): string {
    if (!valor) return '';
    const llenas = Math.round(valor);
    return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
  }
}
