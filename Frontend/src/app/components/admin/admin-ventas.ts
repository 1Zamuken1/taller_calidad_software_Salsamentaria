import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Venta {
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
      imagen_url?: string;
    };
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
}

@Component({
  selector: 'app-admin-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ventas.html',
  styleUrls: ['./admin-ventas.css']
})
export class AdminVentasComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/ventas';

  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  ventaSeleccionada: Venta | null = null;
  
  loading: boolean = true;
  showDetalleModal: boolean = false;
  
  searchTerm: string = '';
  estadoFiltro: string = '';
  
  mensajeExito: string = '';
  mensajeError: string = '';

  estadisticas = {
    total: 0,
    pendientes: 0,
    completadas: 0,
    canceladas: 0,
    ingresoTotal: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.loading = true;
    this.http.get<Venta[]>(`${this.apiUrl}/`).subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.ventasFiltradas = ventas;
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
        this.mensajeError = 'Error al cargar las ventas';
        this.loading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.estadisticas.total = this.ventas.length;
    this.estadisticas.pendientes = this.ventas.filter(v => v.estado === 'PENDIENTE').length;
    this.estadisticas.completadas = this.ventas.filter(v => v.estado === 'COMPLETADA').length;
    this.estadisticas.canceladas = this.ventas.filter(v => v.estado === 'CANCELADA').length;
    this.estadisticas.ingresoTotal = this.ventas
      .filter(v => v.estado === 'COMPLETADA')
      .reduce((sum, v) => sum + v.total, 0);
  }

  filtrarVentas(): void {
    this.ventasFiltradas = this.ventas.filter(venta => {
      const matchSearch = venta.usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         venta.usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         venta.id.toString().includes(this.searchTerm);
      
      const matchEstado = this.estadoFiltro === '' || venta.estado === this.estadoFiltro;
      
      return matchSearch && matchEstado;
    });
  }

  verDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
    this.showDetalleModal = true;
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.ventaSeleccionada = null;
  }

  cambiarEstado(venta: Venta, nuevoEstado: string): void {
    const mensajes: { [key: string]: string } = {
      'COMPLETADA': 'completar',
      'CANCELADA': 'cancelar',
      'PENDIENTE': 'marcar como pendiente'
    };

    if (confirm(`¿Estás seguro de ${mensajes[nuevoEstado]} esta venta?`)) {
      this.http.put(`${this.apiUrl}/${venta.id}/estado?estado=${nuevoEstado}`, {}).subscribe({
        next: (response: any) => {
          this.mensajeExito = `Venta ${nuevoEstado.toLowerCase()} correctamente`;
          if (response.stock_restaurado) {
            this.mensajeExito += ' (Stock restaurado)';
          }
          this.cargarVentas();
          this.cerrarDetalleModal();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
          this.mensajeError = 'Error al cambiar el estado de la venta';
          setTimeout(() => this.mensajeError = '', 3000);
        }
      });
    }
  }

  eliminarVenta(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta venta? Esta acción no se puede deshacer.')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.mensajeExito = 'Venta eliminada correctamente';
          this.cargarVentas();
          this.cerrarDetalleModal();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('Error al eliminar venta:', err);
          this.mensajeError = 'Error al eliminar la venta';
          setTimeout(() => this.mensajeError = '', 3000);
        }
      });
    }
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
      'COMPLETADA': 'bi-check-circle-fill',
      'CANCELADA': 'bi-x-circle-fill'
    };
    return iconos[estado] || 'bi-circle';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalProductos(venta: Venta): number {
    return venta.detalles.reduce((sum, d) => sum + d.cantidad, 0);
  }
}