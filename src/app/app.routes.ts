import { Routes } from '@angular/router';
import {Local} from './componentes/zimagenes-amongusAWS/local'

import { Prueba } from './componentes/prueba/prueba';
import { New } from './componentes/upImageAWS/new';
import { LocalDetalle } from './componentes/local-detalle/local-detalle';
import { Inicio } from './componentes/inicio/inicio';
import { InicioCategoria } from './componentes/inicio-categoria/inicio-categoria';
import { InicioCategoriaDetalle } from './componentes/inicio-categoria-detalle/inicio-categoria-detalle';
import { Register } from './componentes/register/register';
import { Login } from './componentes/login/login';
import { Comentario } from './componentes/comentario/comentario';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio/categoria', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'register', component: Register },
  { path: 'inicio', component: Inicio}, // Guard de protección
  { path: 'inicio/categoria', component: InicioCategoria },
//   { path: 'inicio/categoria/:id', component: InicioCategoriaDetalle },
  { path: 'inicio/categoria/:id', component: InicioCategoriaDetalle }, // Agregada/Ajustada // <--- Esta ruta captura el ID de la URL
  { path: 'prueba', component: Prueba },
  { path: 'local', component: Local },
  { path: 'new', component: New },
  { path: 'comentario', component: Comentario },
  { path: 'inicio/categoria/:categoriaId/detalle/:id', component: LocalDetalle },
];
