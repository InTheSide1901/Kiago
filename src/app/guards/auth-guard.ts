import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const turistaGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const usuarioStr = localStorage.getItem('usuario');

  if (usuarioStr) {
    const usuario = JSON.parse(usuarioStr);
    
    // Verificamos si es Turista (rol_id = 3)
    if (usuario.rol_id === 3) {
      return true;
    }
  }

  alert('Solo los turistas pueden acceder a esta sección.');
  router.navigate(['/login']); 
  return false;
};