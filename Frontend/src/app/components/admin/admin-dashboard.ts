import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DashboardStats {
  totalVentas: number;
  ventasPendientes: number;
  productosActivos: number;
  stockBajo: number;
  ventasHoy: number;
  ingresosMes: number;
}

interface ProductoTop {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

interface ProductoStockBajo {
  id_producto: number;
  nombre: string;
  stock: number;
  imagen_url: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:8080/api';
  
  stats: DashboardStats = {
    totalVentas: 0,
    ventasPendientes: 0,
    productosActivos: 0,
    stockBajo: 0,
    ventasHoy: 0,
    ingresosMes: 0
  };

  productosTop: ProductoTop[] = [];
  productosStockBajo: ProductoStockBajo[] = [];
  
  loading: boolean = true;
  private charts: Chart[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    // Destruir todos los gráficos al salir del componente
    this.charts.forEach(chart => chart.destroy());
  }

  cargarDatos(): void {
    this.loading = true;

    // Cargar ventas
    this.http.get<any[]>(`${this.apiUrl}/ventas/`).subscribe({
      next: (ventas) => {
        this.procesarVentas(ventas);
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
        this.loading = false;
      }
    });
  }

  procesarVentas(ventas: any[]): void {
    this.stats.totalVentas = ventas.length;
    this.stats.ventasPendientes = ventas.filter(v => v.estado === 'PENDIENTE').length;

    // Ventas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    this.stats.ventasHoy = ventas.filter(v => v.fecha.startsWith(hoy)).length;

    // Ingresos del mes actual
    const mesActual = new Date().getMonth();
    this.stats.ingresosMes = ventas
      .filter(v => {
        const fecha = new Date(v.fecha);
        return fecha.getMonth() === mesActual && v.estado === 'COMPLETADA';
      })
      .reduce((sum, v) => sum + v.total, 0);

    // Calcular productos más vendidos
    this.calcularProductosTop(ventas);
    this.crearGraficoVentas(ventas);
  }

  calcularProductosTop(ventas: any[]): void {
    const productosMap = new Map<string, { cantidad: number; ingresos: number }>();

    ventas.forEach(venta => {
      if (venta.estado === 'COMPLETADA') {
        venta.detalles.forEach((detalle: any) => {
          const nombre = detalle.producto.nombre;
          const actual = productosMap.get(nombre) || { cantidad: 0, ingresos: 0 };
          productosMap.set(nombre, {
            cantidad: actual.cantidad + detalle.cantidad,
            ingresos: actual.ingresos + detalle.subtotal
          });
        });
      }
    });

    this.productosTop = Array.from(productosMap.entries())
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    this.crearGraficoProductosTop();
  }

  cargarProductos(): void {
    this.http.get<any[]>(`${this.apiUrl}/productos`).subscribe({
      next: (productos) => {
        this.stats.productosActivos = productos.filter(p => p.estado).length;
        
        // Productos con stock bajo (menos de 10 unidades)
        this.productosStockBajo = productos
          .filter(p => p.stock < 10 && p.estado)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5);
        
        this.stats.stockBajo = this.productosStockBajo.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.loading = false;
      }
    });
  }

  crearGraficoVentas(ventas: any[]): void {
    // Obtener últimos 7 días
    const dias: string[] = [];
    const ventasPorDia: number[] = [];

    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      dias.push(fecha.toLocaleDateString('es', { weekday: 'short', day: 'numeric' }));
      
      const ventasDelDia = ventas.filter(v => v.fecha.startsWith(fechaStr));
      ventasPorDia.push(ventasDelDia.length);
    }

    setTimeout(() => {
      const canvas = document.getElementById('ventasChart') as HTMLCanvasElement;
      if (canvas) {
        const chart = new Chart(canvas, {
          type: 'line',
          data: {
            labels: dias,
            datasets: [{
              label: 'Ventas',
              data: ventasPorDia,
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
        this.charts.push(chart);
      }
    }, 100);
  }

  crearGraficoProductosTop(): void {
    setTimeout(() => {
      const canvas = document.getElementById('productosChart') as HTMLCanvasElement;
      if (canvas && this.productosTop.length > 0) {
        const chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: this.productosTop.map(p => p.nombre),
            datasets: [{
              label: 'Unidades vendidas',
              data: this.productosTop.map(p => p.cantidad),
              backgroundColor: [
                '#3498db',
                '#2ecc71',
                '#f39c12',
                '#e74c3c',
                '#9b59b6'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
        this.charts.push(chart);
      }
    }, 100);
  }
}