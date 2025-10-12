import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  nombreUsuario: string | null = null;
  cantidadCarrito: number = 0;

  constructor(
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.authService.obtenerNombreUsuario();
    
    // Suscribirse a cambios en el carrito
    this.carritoService.getCarrito().subscribe(() => {
      this.cantidadCarrito = this.carritoService.getCantidadTotal();
    });
  }

  logout() {
    this.authService.logout();
    this.carritoService.vaciarCarrito();
    this.router.navigate(['/login']);
  }
}