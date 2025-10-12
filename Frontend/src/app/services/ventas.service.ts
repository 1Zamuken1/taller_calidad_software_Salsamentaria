import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Venta {
  id: number;
  fecha: string;
  total: number;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  detalles: Array<{
    id: number;
    producto: {
      id_producto: number;
      nombre: string;
      precio: number;
    };
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  obtenerTodasLasVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/`);
  }

  obtenerVentaPorId(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  actualizarEstadoVenta(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  eliminarVenta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}