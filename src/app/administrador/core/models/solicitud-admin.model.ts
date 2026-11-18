/** Respuesta cruda de `GET /api/solicitudes/pendientes`. */
export interface SolicitudAdminRaw {
  id: number;
  usuario_id: number;
  categoria_id: number;
  nombre: string;
  nombre_titular?: string | null;
  apellido?: string | null;
  descripcion?: string | null;
  telefono?: string | null;
  correo_electronico?: string | null;
  sitio_web?: string | null;
  calle?: string | null;
  altura?: string | number | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
  categoria_nombre?: string | null;
  ciudad_nombre?: string | null;
  url_imagen?: string | null;
  estado?: string | null;
  motivo_rechazo?: string | null;
  created_at?: string | null;
}

export interface CredencialesGeneradas {
  email: string;
  password_temporal: string;
}

/** Respuesta de `POST /api/solicitudes/:id/aprobar`. */
export interface AprobarSolicitudResponse {
  message?: string;
  credenciales?: CredencialesGeneradas | null;
}
