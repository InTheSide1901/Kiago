export type EstadoLugar = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export type FiltroEstado = 'TODOS' | EstadoLugar;

/** De dónde sale el registro: de la tabla `locales` o de `solicitudes_locales`. */
export type OrigenLugar = 'local' | 'solicitud';

export interface LugarHorario {
  dia: string;
  apertura: string;
  cierre: string;
}

/**
 * Vista unificada que consume el panel.
 * Une locales ya aprobados con solicitudes pendientes del backend.
 */
export interface LugarAdmin {
  id: number;
  origen: OrigenLugar;
  titulo: string;
  categoria: string;
  descripcion: string;
  email: string;
  telefono: string;
  sitioWeb?: string;
  direccion: string;
  ciudad: string;
  estado: EstadoLugar;
  creadoEn: string;
  propietarioId: number;
  propietarioNombre: string;
  imagen?: string;
  motivoRechazo?: string;
  horarios?: LugarHorario[];
  precios?: string;
}
