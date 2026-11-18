/** `GET /api/categorias` */
export interface CategoriaRaw {
  id: number;
  nombre: string;
  icono?: string | null;
}

/** `GET /api/locales` (columnas de la tabla `locales`). */
export interface LocalRaw {
  id: number;
  usuario_id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string | null;
  telefono?: string | null;
  correo_electronico?: string | null;
  sitio_web?: string | null;
  created_at?: string | null;
}

/** `GET /api/locales/:id` (incluye joins de dirección, ciudad e imagen). */
export interface LocalDetalleRaw extends LocalRaw {
  direccion?: string | null;
  altura?: string | number | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
  ciudad_localidad?: string | null;
  provincia?: string | null;
  imagen_principal?: string | null;
}

/** `GET /api/usuarios/:id` */
export interface UsuarioRaw {
  id: number;
  rol_id: number;
  nombre: string;
  apellido: string;
  email?: string | null;
  telefono?: string | null;
  foto_perfil?: string | null;
  created_at?: string | null;
}
