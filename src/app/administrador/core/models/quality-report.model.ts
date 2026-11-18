export type TipoReporte =
  | 'HORARIO_DESACTUALIZADO'
  | 'LUGAR_CERRADO'
  | 'DATOS_ERRONEOS'
  | 'FALTAN_IMAGENES'
  | 'MAL_TRATO'
  | 'CAMBIO_DUENO';

export type EstadoReporte = 'ABIERTO' | 'EN_REVISION' | 'RESUELTO' | 'DESCARTADO';

export interface QualityReport {
  id: number;
  tipo: TipoReporte;
  lugarId: number;
  lugarTitulo: string;
  comentario: string;
  reportadoPor: string;
  estado: EstadoReporte;
  creadoEn: string;
}

/** Alias con el nombre usado en el contrato del backend. */
export type QualityReportDto = QualityReport;
