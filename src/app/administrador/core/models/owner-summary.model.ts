export interface OwnerSummary {
  id: number;
  nombre: string;
  email: string;
  cantidadLocales: number;
  verificado: boolean;
  creadoEn: string;
}

/** Alias con el nombre usado en el contrato del backend. */
export type OwnerSummaryDto = OwnerSummary;
