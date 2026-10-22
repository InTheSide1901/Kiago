import { Routes } from '@angular/router';
import { Local } from './componentes/zimagenes-amongusAWS/local';

import { Prueba } from './componentes/prueba/prueba';
import { New } from './componentes/upImageAWS/new';
import { LocalDetalle } from './componentes/local-detalle/local-detalle';
import { Inicio } from './componentes/inicio/inicio';
import { InicioCategoria } from './componentes/inicio-categoria/inicio-categoria';
import { InicioCategoriaDetalle } from './componentes/inicio-categoria-detalle/inicio-categoria-detalle';
import { Register } from './componentes/register/register';
import { Login } from './componentes/login/login';
import { Comentario } from './componentes/comentario/comentario';
import { SolicitudLocal } from './componentes/solicitud-local/solicitud-local';
import { InicioAdmin } from './administrador/inicio/inicio';
import { Favoritos } from './componentes/favoritos/favoritos';
import { SobreNosotros } from './componentes/sobre-nosotros/sobre-nosotros';
import { Perfil } from './componentes/perfil/perfil';
import { MisAprovaciones } from './componentes/mis-aprovaciones/mis-aprovaciones';

// 1. Importamos los Guards que van a proteger las rutas
import { adminGuard } from './administrador/guards/admin-guard';
import { turistaGuard } from './guards/auth-guard';
import { duenoGuard } from './dueno/guards/dueno-guard'; // Descomentar cuando crees vistas de dueño
import { PantallaIncial } from './dueno/pantalla-incial/pantalla-incial';
import { Contactanos } from './componentes/contactanos/contactanos';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS (No requieren estar logueado) ---
  { path: '', redirectTo: 'inicio/categoria', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'inicio', component: Inicio }, // La dejé pública como base

  // --- RUTAS DESCARTADAS / IGNORADAS ---
  { path: 'local', component: Local },
  { path: 'new', component: New },

  // --- RUTAS PARA TURISTAS (Protegidas por turistaGuard) ---
  { path: 'favoritos', component: Favoritos, canActivate: [turistaGuard] },
  { path: 'inicio/categoria', component: InicioCategoria, canActivate: [turistaGuard] },
  { path: 'inicio/categoria/:id', component: InicioCategoriaDetalle, canActivate: [turistaGuard] },
  { path: 'prueba', component: Prueba, canActivate: [turistaGuard] },
  { path: 'comentario', component: Comentario, canActivate: [turistaGuard] },
  { path: 'inicio/categoria/:categoriaId/detalle/:id', component: LocalDetalle, canActivate: [turistaGuard] },
  { path: 'sobreNosotros', component: SobreNosotros, canActivate: [turistaGuard] },
  { path: 'inicio/perfil', component: Perfil, canActivate: [turistaGuard] },
  { path: 'misAprovaciones', component: MisAprovaciones, canActivate: [turistaGuard] },
  { path: 'contactanos', component: Contactanos, canActivate: [turistaGuard] },
  { path: 'solicitud', component: SolicitudLocal, canActivate: [turistaGuard] },

  // --- RUTAS PARA ADMINISTRADORES (Protegidas por adminGuard) ---
  { path: 'admin', component: InicioAdmin, canActivate: [adminGuard] },

  // --- RUTAS PARA DUEÑOS (Futuro) ---
  { path: 'panel-dueno', component: PantallaIncial, canActivate: [duenoGuard] },
  
  // --- RUTA COMODÍN (Si escriben cualquier otra cosa) ---
  { path: '**', redirectTo: 'inicio/categoria' }
];