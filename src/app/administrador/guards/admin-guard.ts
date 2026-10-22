import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const usuarioStr = localStorage.getItem('usuario');

  if (usuarioStr) {
    const usuario = JSON.parse(usuarioStr);
    
    // Verificamos si es Administrador (rol_id = 1)
    if (usuario.rol_id === 1) {
      return true;
    }
  }

  alert('Acceso denegado. Solo los administradores pueden entrar acá.');
  router.navigate(['/']); 
  return false;
};
