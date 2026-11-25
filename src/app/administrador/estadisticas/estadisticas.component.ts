import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminDashboardData, AdminMetricsService } from '../service/admin-metrics.service';

@Component({
  selector: 'app-admin-estadisticas',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './estadisticas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadisticasComponent implements OnInit {
  private readonly metricsService = inject(AdminMetricsService);

  protected readonly data = signal<AdminDashboardData | null>(null);
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string>('');
  protected readonly medallas = ['🥇', '🥈', '🥉'];

  ngOnInit(): void {
    this.metricsService.obtenerEstadisticas().subscribe({
      next: (res) => {
        this.data.set(res);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error.set('No se pudieron cargar las estadísticas desde el servidor.');
        this.cargando.set(false);
      },
    });
  }

  protected estrellas(valor?: number): string {
    if (!valor) return '';
    const llenas = Math.min(5, Math.max(0, Math.round(valor)));
    return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
  }
}