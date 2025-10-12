import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.estaAutenticado()) {
    console.log('No autenticado, redirigiendo al login');
    return router.createUrlTree(['/login']);
  }

  // Verificar si es admin
  if (authService.isAdmin()) {
    return true; // Es admin, permitir acceso
  }

  // No es admin, redirigir a productos
  console.log('Acceso denegado: No es administrador');
  return router.createUrlTree(['/productos']);
};