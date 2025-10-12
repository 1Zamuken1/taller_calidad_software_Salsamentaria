import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css']
})
export class CarritoComponent implements OnInit {
  items: ItemCarrito[] = [];
  total: number = 0;
  isProcessing: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carritoService.getCarrito().subscribe(items => {
      this.items = items;
      this.total = this.carritoService.getTotal();
    });
  }

  actualizarCantidad(id_producto: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminarItem(id_producto);
      return;
    }
    this.carritoService.actualizarCantidad(id_producto, cantidad);
  }

  incrementar(item: ItemCarrito): void {
    if (item.cantidad < item.producto.stock) {
      this.actualizarCantidad(item.producto.id_producto, item.cantidad + 1);
    } else {
      this.mensajeError = `Stock máximo: ${item.producto.stock} unidades`;
      setTimeout(() => this.mensajeError = '', 3000);
    }
  }

  decrementar(item: ItemCarrito): void {
    if (item.cantidad > 1) {
      this.actualizarCantidad(item.producto.id_producto, item.cantidad - 1);
    }
  }

  eliminarItem(id_producto: number): void {
    if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      this.carritoService.eliminarProducto(id_producto);
    }
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  finalizarCompra(): void {
    if (this.items.length === 0) {
      this.mensajeError = 'El carrito está vacío';
      setTimeout(() => this.mensajeError = '', 3000);
      return;
    }

    // Obtener ID del usuario desde AuthService
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.mensajeError = 'Debes iniciar sesión para finalizar la compra';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.isProcessing = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // Crear la venta con el userId obtenido
    this.carritoService.crearVentaDesdeCarrito(userId).subscribe({
      next: (response) => {
        this.mensajeExito = `¡Compra realizada con éxito! Total: $${response.total.toLocaleString('es-CO')}. ID de venta: ${response.id_venta}`;
        this.carritoService.vaciarCarrito();
        this.isProcessing = false;

        // Redirigir después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/productos']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error al crear venta:', err);
        this.mensajeError = err.error?.error || 'Error al procesar la compra. Intenta de nuevo.';
        this.isProcessing = false;
      }
    });
  }

  continuarComprando(): void {
    this.router.navigate(['/productos']);
  }
}