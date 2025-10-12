import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  estado: boolean;
  nombreCategoria?: string;  // Nuevo campo del DTO
  idCategoria?: number;       // Nuevo campo del DTO
  cantidad?: number;          // Para el formulario del carrito
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Producto): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/crear`, producto);
  }

  actualizarProducto(id: number, data: any): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/editar/${id}`, data);
  }

  eliminarProducto(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/eliminar/${id}`);
  }
}