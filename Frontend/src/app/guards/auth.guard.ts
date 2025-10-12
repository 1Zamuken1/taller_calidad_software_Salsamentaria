import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true; // Usuario autenticado, permitir acceso
  }

  // Usuario no autenticado, redirigir al login
  console.log('Acceso denegado, redirigiendo al login');
  return router.createUrlTree(['/login']);
};