import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent implements OnInit {
  nombreAdmin: string = '';
  sidebarCollapsed: boolean = false;
  currentRoute: string = '';
  isMobile: boolean = false;

  menuItems = [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', badge: null },
    { path: '/admin/productos', icon: 'bi-box-seam', label: 'Productos', badge: null },
    { path: '/admin/ventas', icon: 'bi-receipt', label: 'Ventas', badge: null },
    { path: '/admin/categorias', icon: 'bi-tags', label: 'Categorías', badge: null }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Detectar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      // Cerrar sidebar en móvil después de navegar
      if (this.isMobile && !this.sidebarCollapsed) {
        this.sidebarCollapsed = true;
      }
    });
  }

  ngOnInit(): void {
    this.nombreAdmin = this.authService.obtenerNombreUsuario() || 'Administrador';
    this.currentRoute = this.router.url;
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 769;
    // En móvil, colapsar por defecto
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  isActive(path: string): boolean {
    return this.currentRoute === path;
  }

  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}