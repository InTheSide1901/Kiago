# Panel de administración (integrado en la app Kiago)

Este módulo es el port de `Proyecto integrador/kiago-admin-frontend` (Angular 21)
dentro de la app principal `Kiago` (Angular 22), adaptado para convivir con las
interfaces de **turista** y **dueño** sin modificarlas.

## Rutas

| Ruta | Componente | Estado |
|---|---|---|
| `/admin` | redirect a `/admin/pendientes` | — |
| `/admin/pendientes` | `PendientesComponent` | **Conectado al backend real** |
| `/admin/lugares` | `TodosLugaresComponent` | **Conectado al backend real** |
| `/admin/usuarios` | `UsuariosComponent` | Endpoint pendiente |
| `/admin/estadisticas` | `EstadisticasComponent` | Endpoint pendiente |
| `/admin/reportes` | `ControlCalidadComponent` | Endpoint pendiente |

Todo `/admin/**` está protegido por `administrador/guards/admin-guard.ts`
(`rol_id === 1`), el mismo que usa la app. El login es el de la app
(`/login`): al ingresar un administrador redirige a `/admin`.

## Cambios respecto del proyecto original

- **Sin login propio**: se reutiliza el login y la sesión (`token` + `usuario`)
  de la app principal y su `jwtInterceptor`.
- **Sin mock**: se eliminó `mock-api.interceptor.ts`. El panel consume el
  backend Node/Express compartido (`http://localhost:3000/api`).
- **Servicios adaptados**: `SolicitudesAdminService` y `LugaresAdminService`
  trabajan con los endpoints reales y mapean la respuesta `snake_case` de MySQL
  (`nombre`, `correo_electronico`, `created_at`) al modelo del panel.
- **Diseño unificado**: el panel usa el mismo lenguaje visual que la interfaz
  de dueño (Tailwind): navbar `slate-900` con el logo "Mi App KIAGO", fondo
  `#f8f9fc`, tarjetas blancas `rounded-2xl` con `shadow-sm`, botones índigo y
  badges emerald/amber/rose. No agrega CSS global propio.
- **Datos unificados**: "Todos los lugares" combina locales aprobados
  (`GET /api/locales`) con solicitudes pendientes
  (`GET /api/solicitudes/pendientes`). Como `/api/locales` solo devuelve las
  columnas base, la dirección, ciudad e imagen se completan consultando
  `GET /api/locales/categoria/:id` una vez por categoría (tolerante a fallos) y
  el nombre del dueño con `GET /api/usuarios/:id`. Al abrir el detalle se
  refresca con `GET /api/locales/:id`.

## Endpoints usados

| Acción | Endpoint |
|---|---|
| Listar pendientes | `GET /api/solicitudes/pendientes` |
| Aprobar solicitud | `POST /api/solicitudes/:id/aprobar` |
| Rechazar solicitud | `PUT /api/solicitudes/:id/rechazar` |
| Listar locales aprobados | `GET /api/locales` |
| Locales enriquecidos por categoría | `GET /api/locales/categoria/:id` |
| Detalle de local | `GET /api/locales/:id` |
| Categorías | `GET /api/categorias` |
| Dueño de un local | `GET /api/usuarios/:id` |

## Pendiente del backend

No se inventaron URLs. Para activar estas pantallas hace falta que el backend
exponga:

1. **Usuarios**: listado de dueños con cantidad de locales.
2. **Estadísticas**: top de lugares, contadores de tráfico y actividad reciente.
3. **Reportes**: denuncias/flag de locales con estado.

Además, el backend no expone un listado global de solicitudes rechazadas: el
filtro "Rechazados" de la tabla puede quedar vacío aunque existan.
