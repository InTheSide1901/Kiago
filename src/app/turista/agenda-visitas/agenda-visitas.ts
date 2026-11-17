import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FullCalendarModule,
  CalendarOptions
} from '@fullcalendar/angular';

import dayGridPlugin from '@fullcalendar/angular/daygrid';
import themePlugin from '@fullcalendar/angular/themes/monarch';

interface VisitaAgendada {
  agenda_id: number;
  local_id: number;
  nombre_local: string;
  imagen: string | null;
  reputacion: number | null;
  fecha_visita: string;
}

@Component({
  imports: [FullCalendarModule],
  selector: 'app-agenda-visitas',
  styleUrl: './agenda-visitas.css',
  templateUrl: './agenda-visitas.html',
})
export class AgendaVisitas implements OnInit {
  private http = inject(HttpClient);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private readonly apiUrl = 'http://localhost:3000/api/agenda';

  visitas: VisitaAgendada[] = [];
  visitaPendienteEliminar: VisitaAgendada | null = null;
  cargando = true;
  eliminando = false;
  errorCarga = '';
  errorEliminar = '';

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, themePlugin],
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: []
  };

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.http.get<{ mensaje: string; agenda: VisitaAgendada[] }>(this.apiUrl).subscribe({
      next: ({ agenda }) => {
        this.visitas = agenda ?? [];
        this.actualizarCalendario();
        this.cargando = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorCarga = 'No se pudo cargar tu agenda. Intenta nuevamente más tarde.';
        this.cargando = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  // Genera los eventos a partir de la lista actual.
  obtenerEventos() {
    return this.visitas.map(visita => ({
      id: String(visita.agenda_id),
      title: visita.nombre_local,
      date: this.normalizarFecha(visita.fecha_visita)
    }));
  }

  private actualizarCalendario(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.obtenerEventos()
    };
  }

  // Abre la confirmación de eliminación.
  solicitarEliminar(id: number): void {
    this.visitaPendienteEliminar =
      this.visitas.find(visita => visita.agenda_id === id) ?? null;
    this.errorEliminar = '';
  }

  // Cancela la eliminación.
  cancelarEliminar(): void {
    if (this.eliminando) return;
    this.visitaPendienteEliminar = null;
    this.errorEliminar = '';
  }

  // Confirma la eliminación y actualiza la lista y el calendario.
  confirmarEliminar(): void {
    if (!this.visitaPendienteEliminar || this.eliminando) return;

    const id = this.visitaPendienteEliminar.agenda_id;
    this.eliminando = true;
    this.errorEliminar = '';

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.visitas = this.visitas.filter(visita => visita.agenda_id !== id);
        this.actualizarCalendario();
        this.visitaPendienteEliminar = null;
        this.eliminando = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorEliminar = 'No se pudo eliminar la visita. Intenta nuevamente.';
        this.eliminando = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private normalizarFecha(fecha: string): string {
    return fecha.slice(0, 10);
  }

  formatearFecha(fecha: string): string {
    const [anio, mes, dia] = this.normalizarFecha(fecha).split('-').map(Number);
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' })
      .format(new Date(anio, mes - 1, dia));
  }
}
