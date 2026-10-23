import { Routes } from '@angular/router';
import { Prueba } from './turista/pantalla-inicial-mapa/prueba';
import { LocalDetalle } from './turista/pantalla-local-detalle/local-detalle';
import { InicioCategoria } from './turista/pantalla-inicial/inicio-categoria';
import { InicioCategoriaDetalle } from './turista/inicio-categoria-detalle/inicio-categoria-detalle';
import { Register } from './componentes-publicos/register/register';
import { Login } from './componentes-publicos/login/login';
import { Comentario } from './turista/comentario/comentario';
import { SolicitudLocal } from './turista/solicitud-local/solicitud-local';
import { InicioAdmin } from './administrador/inicio/inicio';
import { Favoritos } from './turista/favoritos/favoritos';
import { SobreNosotros } from './turista/sobre-nosotros/sobre-nosotros';
import { Perfil } from './turista/perfil/perfil';
import { MisAprovaciones } from './turista/mis-aprovaciones/mis-aprovaciones';
import { Search } from './turista/search/search';

// Guards que van a proteger las rutas
import { adminGuard } from './administrador/guards/admin-guard';
import { turistaGuard } from './turista/guards/auth-guard';
import { duenoGuard } from './dueno/guards/dueno-guard';
import { PantallaIncial } from './dueno/pantalla-incial/pantalla-incial';
import { Contactanos } from './turista/contactanos/contactanos';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS (No requieren estar logueado) ---
  { path: '', redirectTo: 'inicio/categoria', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'search', component: Search },
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