import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  mensajeExito: string = '';
  cantidadCarrito: number = 0;

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    // Cargar productos
    this.productosService.getProductos().subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);
        console.log('Cantidad de productos:', data.length);
        this.productos = data.map(p => ({ ...p, cantidad: 1 }));
        console.log('Productos procesados:', this.productos);
      },
      error: (err) => console.error('Error al cargar productos', err)
    });

    // Suscribirse al carrito para mostrar cantidad
    this.carritoService.getCarrito().subscribe(() => {
      this.cantidadCarrito = this.carritoService.getCantidadTotal();
    });
  }

  agregar(producto: Producto) {
    if (!producto.cantidad || producto.cantidad <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    if (producto.cantidad > producto.stock) {
      alert(`Solo hay ${producto.stock} unidades disponibles`);
      return;
    }

    this.carritoService.agregarProducto(producto, producto.cantidad);
    
    this.mensajeExito = `✅ ${producto.nombre} agregado al carrito (${producto.cantidad} unidad${producto.cantidad > 1 ? 'es' : ''})`;
    producto.cantidad = 1;

    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
  }
}