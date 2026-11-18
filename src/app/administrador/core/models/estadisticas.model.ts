export interface LugarPopular {
  lugarId: number;
  titulo: string;
  categoria: string;
  visitas: number;
  comentarios: number;
}

export interface LugarCalificado {
  lugarId: number;
  titulo: string;
  estrellas: number;
}

export interface MetricasTrafico {
  turistasRegistrados: number;
  duenosRegistrados: number;
  totalLocales: number;
  totalComentarios: number;
  mejorCalificado: LugarCalificado | null;
  peorCalificado: LugarCalificado | null;
}

export interface EventoActividad {
  id: number;
  creadoEn: string; // ISO 8601
  descripcion: string;
  lugarId?: number;
  lugarTitulo?: string;
}

export interface EstadisticasDashboard {
  lugaresPopulares: LugarPopular[]; // Top 3
  trafico: MetricasTrafico;
  actividad: EventoActividad[];
}
