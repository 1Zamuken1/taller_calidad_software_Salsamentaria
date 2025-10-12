import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface DetalleVenta {
  id: number;
  producto: {
    id_producto: number;
    nombre: string;
    precio: number;
    imagen_url: string;
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Venta {
  id: number;
  fecha: string;
  total: number;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  detalles: DetalleVenta[];
}

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-compras.html',
  styleUrls: ['./historial-compras.css']
})
export class HistorialComprasComponent implements OnInit {
  ventas: Venta[] = [];
  loading: boolean = true;
  error: string = '';
  ventaExpandida: number | null = null;

  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;
    this.error = '';

    this.http.get<Venta[]>(`${this.apiUrl}/mis-compras`).subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.error = 'Error al cargar el historial de compras';
        this.loading = false;
      }
    });
  }

  toggleDetalles(ventaId: number): void {
    this.ventaExpandida = this.ventaExpandida === ventaId ? null : ventaId;
  }

  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'PENDIENTE': 'badge bg-warning text-dark',
      'COMPLETADA': 'badge bg-success',
      'CANCELADA': 'badge bg-danger'
    };
    return clases[estado] || 'badge bg-secondary';
  }

  getEstadoIcono(estado: string): string {
    const iconos: { [key: string]: string } = {
      'PENDIENTE': 'bi-clock-history',
      'COMPLETADA': 'bi-check-circle',
      'CANCELADA': 'bi-x-circle'
    };
    return iconos[estado] || 'bi-circle';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}