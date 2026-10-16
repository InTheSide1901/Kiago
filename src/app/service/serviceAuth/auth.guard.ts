import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ServiceAuth } from './service-auth';

export const authGuard: CanActivateFn = () => {
  const serviceAuth = inject(ServiceAuth);
  const router = inject(Router);

  if (serviceAuth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};