import { Injectable } from '@angular/core';
import { EstadisticasDashboard } from '../models/estadisticas.model';
import { QualityReport } from '../models/quality-report.model';

/**
 * Métricas, estadísticas y reportes de calidad.
 *
 * Por ahora muestra DATOS SIMULADOS estáticos: el backend todavía no expone
 * los endpoints de estadísticas ni de reportes. Cuando existan, se conectan
 * acá y se reemplazan los datos de demostración.
 */
@Injectable({ providedIn: 'root' })
export class AdminMetricsService {
  /** Indica que los datos que expone el servicio son de demostración. */
  readonly datosSimulados = true;

  readonly dashboard: EstadisticasDashboard = {
    lugaresPopulares: [
      { lugarId: 1, titulo: 'DEMO La Trattoria', categoria: 'Restaurantes', visitas: 1240, comentarios: 86 },
      { lugarId: 2, titulo: 'DEMO Parque Centenario', categoria: 'Parques y plazas', visitas: 985, comentarios: 64 },
      { lugarId: 3, titulo: 'DEMO Cine Aurora', categoria: 'Cines y teatros', visitas: 755, comentarios: 51 },
    ],
    trafico: {
      turistasRegistrados: 128,
      duenosRegistrados: 24,
      totalLocales: 47,
      totalComentarios: 312,
      mejorCalificado: { lugarId: 1, titulo: 'DEMO La Trattoria', estrellas: 4.8 },
      peorCalificado: { lugarId: 4, titulo: 'DEMO Bar El Faro', estrellas: 3.1 },
    },
    actividad: [
      { id: 1, creadoEn: '2026-11-18T09:12:00', descripcion: 'Se aprobó una solicitud y se publicó el local', lugarTitulo: 'DEMO Solicitud Dueño' },
      { id: 2, creadoEn: '2026-11-17T18:40:00', descripcion: 'Nuevo comentario con calificación de 5 estrellas', lugarTitulo: 'DEMO La Trattoria' },
      { id: 3, creadoEn: '2026-11-17T11:05:00', descripcion: 'Un turista envió una solicitud de alta', lugarTitulo: 'DEMO Solicitud Turista' },
      { id: 4, creadoEn: '2026-11-16T16:22:00', descripcion: 'Se rechazó una solicitud por datos incompletos', lugarTitulo: 'DEMO Solicitud Rechazada' },
      { id: 5, creadoEn: '2026-11-15T10:30:00', descripcion: 'Se actualizó el horario de atención', lugarTitulo: 'DEMO Bar El Faro' },
    ],
  };

  readonly reportes: QualityReport[] = [
    {
      id: 1,
      tipo: 'HORARIO_DESACTUALIZADO',
      lugarId: 4,
      lugarTitulo: 'DEMO Bar El Faro',
      comentario: 'Dice que abre hasta las 2 pero cerró a la medianoche.',
      reportadoPor: 'Martina G.',
      estado: 'ABIERTO',
      creadoEn: '2026-11-18T08:45:00',
    },
    {
      id: 2,
      tipo: 'FALTAN_IMAGENES',
      lugarId: 3,
      lugarTitulo: 'DEMO Cine Aurora',
      comentario: 'No tiene fotos de las salas ni de la entrada.',
      reportadoPor: 'Lucas R.',
      estado: 'EN_REVISION',
      creadoEn: '2026-11-17T15:20:00',
    },
    {
      id: 3,
      tipo: 'DATOS_ERRONEOS',
      lugarId: 2,
      lugarTitulo: 'DEMO Parque Centenario',
      comentario: 'El teléfono que figura no existe, marqué y no contesta nadie.',
      reportadoPor: 'Sofía P.',
      estado: 'RESUELTO',
      creadoEn: '2026-11-16T12:10:00',
    },
    {
      id: 4,
      tipo: 'LUGAR_CERRADO',
      lugarId: 1,
      lugarTitulo: 'DEMO La Trattoria',
      comentario: 'Fui el domingo y estaba cerrado aunque decía abierto.',
      reportadoPor: 'Diego M.',
      estado: 'RESUELTO',
      creadoEn: '2026-11-14T19:05:00',
    },
    {
      id: 5,
      tipo: 'MAL_TRATO',
      lugarId: 4,
      lugarTitulo: 'DEMO Bar El Faro',
      comentario: 'El encargado nos trató mal cuando pedimos la cuenta.',
      reportadoPor: 'Carla V.',
      estado: 'DESCARTADO',
      creadoEn: '2026-11-12T21:30:00',
    },
  ];
}
