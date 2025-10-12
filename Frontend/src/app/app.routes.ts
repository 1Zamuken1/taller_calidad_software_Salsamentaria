import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProductosComponent } from './components/productos/productos';
import { CarritoComponent } from './components/carrito/carrito';
import { HistorialComprasComponent } from './components/historial-compras/historial-compras';
import { AdminLayoutComponent } from './components/layout/admin-layout';
import { AdminDashboardComponent } from './components/admin/admin-dashboard';
import { AdminProductosComponent } from './components/admin/admin-productos';
import { AdminVentasComponent } from './components/admin/admin-ventas';
import { AdminCategoriasComponent } from './components/admin/admin-categorias';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Rutas públicas
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rutas de cliente (requieren autenticación)
  { 
    path: 'productos', 
    component: ProductosComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'carrito', 
    component: CarritoComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'mis-compras', 
    component: HistorialComprasComponent,
    canActivate: [authGuard]
  },

  // Rutas de admin (requieren autenticación y rol ADMIN)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'productos', component: AdminProductosComponent },
      { path: 'ventas', component: AdminVentasComponent },
      { path: 'categorias', component: AdminCategoriasComponent }
    ]
  },

  // Ruta por defecto
  { path: '**', redirectTo: '/login' }
];