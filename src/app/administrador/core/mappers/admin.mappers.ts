import { LocalDetalleRaw, LocalRaw, UsuarioRaw } from '../models/catalogo.model';
import { EstadoLugar, LugarAdmin } from '../models/lugar-admin.model';
import { SolicitudAdminRaw } from '../models/solicitud-admin.model';

const SIN_DATO = '—';

function texto(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function normalizarEstado(valor: string | null | undefined): EstadoLugar {
  const estado = (valor ?? '').toLowerCase();
  if (estado === 'aprobado') return 'APROBADO';
  if (estado === 'rechazado') return 'RECHAZADO';
  return 'PENDIENTE';
}

function crearDireccion(calle: string | null | undefined, altura: string | number | null | undefined): string {
  const partes = [texto(calle), texto(altura)].filter((parte) => parte.length > 0);
  return partes.join(' ');
}

function crearNombreCompleto(nombre: string | null | undefined, apellido: string | null | undefined): string {
  const partes = [texto(nombre), texto(apellido)].filter((parte) => parte.length > 0);
  return partes.length > 0 ? partes.join(' ') : SIN_DATO;
}

/** Convierte una solicitud pendiente en la vista que consume el panel. */
export function mapSolicitud(solicitud: SolicitudAdminRaw): LugarAdmin {
  return {
    id: solicitud.id,
    origen: 'solicitud',
    titulo: texto(solicitud.nombre) || SIN_DATO,
    categoria: texto(solicitud.categoria_nombre) || 'Sin categoría',
    descripcion: texto(solicitud.descripcion),
    email: texto(solicitud.correo_electronico),
    telefono: texto(solicitud.telefono),
    sitioWeb: texto(solicitud.sitio_web) || undefined,
    direccion: crearDireccion(solicitud.calle, solicitud.altura) || SIN_DATO,
    ciudad: texto(solicitud.ciudad_nombre) || SIN_DATO,
    estado: normalizarEstado(solicitud.estado),
    creadoEn: texto(solicitud.created_at),
    propietarioId: solicitud.usuario_id,
    propietarioNombre: crearNombreCompleto(solicitud.nombre_titular, solicitud.apellido),
    imagen: texto(solicitud.url_imagen) || undefined,
    motivoRechazo: texto(solicitud.motivo_rechazo) || undefined,
  };
}

/** Convierte un local aprobado en la vista del panel. */
export function mapLocal(
  local: LocalRaw,
  categorias: ReadonlyMap<number, string>,
  detalle?: LocalDetalleRaw,
  propietarioNombre?: string,
): LugarAdmin {
  return {
    id: local.id,
    origen: 'local',
    titulo: texto(detalle?.nombre ?? local.nombre) || SIN_DATO,
    categoria: categorias.get(local.categoria_id) ?? 'Sin categoría',
    descripcion: texto(detalle?.descripcion ?? local.descripcion),
    email: texto(detalle?.correo_electronico ?? local.correo_electronico),
    telefono: texto(detalle?.telefono ?? local.telefono),
    sitioWeb: texto(detalle?.sitio_web ?? local.sitio_web) || undefined,
    direccion: crearDireccion(detalle?.direccion, detalle?.altura) || SIN_DATO,
    ciudad: texto(detalle?.ciudad_localidad) || SIN_DATO,
    estado: 'APROBADO',
    creadoEn: texto(local.created_at),
    propietarioId: local.usuario_id,
    propietarioNombre: propietarioNombre || `Dueño #${local.usuario_id}`,
    imagen: texto(detalle?.imagen_principal) || undefined,
  };
}

/** Completa un local con los datos de `GET /locales/:id` y su dueño. */
export function aplicarDetalle(
  base: LugarAdmin,
  detalle: LocalDetalleRaw,
  usuario: UsuarioRaw | null,
): LugarAdmin {
  return {
    ...base,
    titulo: texto(detalle.nombre) || base.titulo,
    descripcion: texto(detalle.descripcion) || base.descripcion,
    email: texto(detalle.correo_electronico) || base.email,
    telefono: texto(detalle.telefono) || base.telefono,
    sitioWeb: texto(detalle.sitio_web) || base.sitioWeb,
    direccion: crearDireccion(detalle.direccion, detalle.altura) || base.direccion,
    ciudad: texto(detalle.ciudad_localidad) || base.ciudad,
    imagen: texto(detalle.imagen_principal) || base.imagen,
    propietarioNombre: usuario
      ? crearNombreCompleto(usuario.nombre, usuario.apellido)
      : base.propietarioNombre,
  };
}
