import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const duenoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const usuarioStr = localStorage.getItem('usuario');

  if (usuarioStr) {
    const usuario = JSON.parse(usuarioStr);
    
    // Verificamos si es Dueño (rol_id = 2)
    if (usuario.rol_id === 2) {
      return true;
    }
  }

  alert('Acceso denegado. Esta sección es exclusiva para dueños de locales.');
  router.navigate(['/login']); 
  return false;
};
