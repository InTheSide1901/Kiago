/**
 * Configuración de la API del panel de administración.
 *
 * Apunta al backend Node/Express que ya usan las interfaces de turista y dueño
 * (mismo host y puerto), así el panel comparte sesión JWT y datos reales.
 */
export const ADMIN_API = {
  baseUrl: 'http://localhost:3000/api',
  paths: {
    solicitudesPendientes: '/solicitudes/pendientes',
    aprobarSolicitud: (id: number) => `/solicitudes/${id}/aprobar`,
    rechazarSolicitud: (id: number) => `/solicitudes/${id}/rechazar`,
    locales: '/locales',
    localesPorCategoria: (categoriaId: number) => `/locales/categoria/${categoriaId}`,
    localDetalle: (id: number) => `/locales/${id}`,
    categorias: '/categorias',
    usuario: (id: number) => `/usuarios/${id}`,
  },
} as const;
