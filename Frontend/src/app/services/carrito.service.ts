import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from './productos.service';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export interface VentaRequest {
  id_usuario: number;
  detalles: DetalleRequest[];
}

export interface DetalleRequest {
  id_producto: number;
  cantidad: number;
}

export interface VentaResponse {
  mensaje: string;
  total: number;
  id_venta: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'http://localhost:8080/api';
  private itemsCarrito: ItemCarrito[] = [];
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);

  constructor(private http: HttpClient) {
    this.cargarCarritoDelStorage();
  }

  private cargarCarritoDelStorage(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.itemsCarrito = JSON.parse(carritoGuardado);
      this.carritoSubject.next(this.itemsCarrito);
    }
  }

  getCarrito(): Observable<ItemCarrito[]> {
    return this.carritoSubject.asObservable();
  }

  getItems(): ItemCarrito[] {
    return this.itemsCarrito;
  }

  agregarProducto(producto: Producto, cantidad: number): void {
    if (cantidad <= 0) {
      console.warn('Cantidad debe ser mayor a 0');
      return;
    }

    const itemExistente = this.itemsCarrito.find(
      item => item.producto.id_producto === producto.id_producto
    );

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
    } else {
      const nuevoItem: ItemCarrito = {
        producto: producto,
        cantidad: cantidad,
        subtotal: cantidad * producto.precio
      };
      this.itemsCarrito.push(nuevoItem);
    }

    this.actualizarCarrito();
  }

  eliminarProducto(id_producto: number): void {
    this.itemsCarrito = this.itemsCarrito.filter(
      item => item.producto.id_producto !== id_producto
    );
    this.actualizarCarrito();
  }

  actualizarCantidad(id_producto: number, cantidad: number): void {
    const item = this.itemsCarrito.find(
      item => item.producto.id_producto === id_producto
    );

    if (item) {
      if (cantidad <= 0) {
        this.eliminarProducto(id_producto);
      } else {
        item.cantidad = cantidad;
        item.subtotal = cantidad * item.producto.precio;
        this.actualizarCarrito();
      }
    }
  }

  vaciarCarrito(): void {
    this.itemsCarrito = [];
    this.actualizarCarrito();
  }

  getTotal(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.subtotal, 0);
  }

  getCantidadTotal(): number {
    return this.itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
  }

  private actualizarCarrito(): void {
    this.carritoSubject.next(this.itemsCarrito);
    localStorage.setItem('carrito', JSON.stringify(this.itemsCarrito));
  }

  // Crear venta desde el carrito
  crearVentaDesdeCarrito(id_usuario: number): Observable<VentaResponse> {
    const detalles: DetalleRequest[] = this.itemsCarrito.map(item => ({
      id_producto: item.producto.id_producto,
      cantidad: item.cantidad
    }));

    const ventaRequest: VentaRequest = {
      id_usuario: id_usuario,
      detalles: detalles
    };

    return this.http.post<VentaResponse>(`${this.apiUrl}/ventas/crear`, ventaRequest);
  }
}