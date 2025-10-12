import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  estado: boolean;
  categoria: Categoria;
}

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.html',
  styleUrls: ['./admin-productos.css']
})
export class AdminProductosComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api';

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  productosFiltrados: Producto[] = [];
  
  loading: boolean = true;
  showModal: boolean = false;
  isEditing: boolean = false;
  
  searchTerm: string = '';
  selectedCategoria: string = '';
  
  mensajeExito: string = '';
  mensajeError: string = '';

  productoForm: Partial<Producto> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagen_url: '',
    estado: true
  };
  categoriaSeleccionada: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Inicializando AdminProductosComponent...');
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.mensajeError = '';
    
    console.log('Cargando productos desde:', `${this.apiUrl}/productos/admin`);
    
    // Cargar productos desde el endpoint de admin
    this.http.get<Producto[]>(`${this.apiUrl}/productos/admin`).subscribe({
      next: (productos) => {
        console.log('✅ Productos recibidos:', productos);
        console.log('Cantidad:', productos.length);
        
        // Verificar cada producto
        productos.forEach((p, index) => {
          console.log(`Producto ${index + 1}:`, {
            id: p.id_producto,
            nombre: p.nombre,
            estado: p.estado,
            imagen: p.imagen_url ? 'Sí' : 'No',
            categoria: p.categoria?.nombre || 'Sin categoría'
          });
        });
        
        this.productos = productos;
        this.productosFiltrados = productos;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Error completo:', err);
        
        if (err.status === 403) {
          this.mensajeError = 'No tienes permisos para ver los productos. Verifica tu rol de ADMIN.';
        } else if (err.status === 0) {
          this.mensajeError = 'Error de conexión. Verifica que el backend esté corriendo.';
        } else {
          this.mensajeError = `Error al cargar productos: ${err.message}`;
        }
        
        this.loading = false;
      }
    });

    // Cargar categorías
    this.http.get<Categoria[]>(`${this.apiUrl}/categorias`).subscribe({
      next: (categorias) => {
        console.log('✅ Categorías cargadas:', categorias);
        this.categorias = categorias;
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
        this.mensajeError = 'Error al cargar categorías';
      }
    });
  }

  filtrarProductos(): void {
  this.productosFiltrados = this.productos.filter(producto => {
    const matchSearch = producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                       producto.descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase());
    
    // ⭐ VALIDAR que categoria exista antes de comparar
    const matchCategoria = this.selectedCategoria === '' || 
                          producto.categoria?.id_categoria.toString() === this.selectedCategoria;
    
    return matchSearch && matchCategoria;
  });
}

  abrirModalCrear(): void {
    this.isEditing = false;
    this.productoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagen_url: '',
      estado: true
    };
    this.categoriaSeleccionada = 0;
    this.mensajeError = '';
    this.showModal = true;
  }

  abrirModalEditar(producto: Producto): void {
  this.isEditing = true;
  this.productoForm = { ...producto };
  this.categoriaSeleccionada = producto.categoria?.id_categoria || 0;
  this.showModal = true;
}

  cerrarModal(): void {
    this.showModal = false;
    this.mensajeError = '';
  }

  guardarProducto(): void {
    if (!this.validarFormulario()) {
      return;
    }

    const productoData: any = {
      nombre: this.productoForm.nombre,
      descripcion: this.productoForm.descripcion,
      precio: this.productoForm.precio,
      stock: this.productoForm.stock,
      imagen_url: this.productoForm.imagen_url,
      estado: this.productoForm.estado,
      id_categoria: this.categoriaSeleccionada
    };

    console.log('Guardando producto:', productoData);

    if (this.isEditing && this.productoForm.id_producto) {
      // Actualizar
      this.http.put(`${this.apiUrl}/editar/${this.productoForm.id_producto}`, productoData, {
        responseType: 'text'
      }).subscribe({
        next: (response) => {
          console.log('✅ Producto actualizado:', response);
          this.mensajeExito = 'Producto actualizado correctamente';
          this.cerrarModal();
          this.cargarDatos();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('❌ Error al actualizar:', err);
          this.mensajeError = 'Error al actualizar el producto';
        }
      });
    } else {
      // Crear
      this.http.post(`${this.apiUrl}/crear`, productoData, {
        responseType: 'text'
      }).subscribe({
        next: (response) => {
          console.log('✅ Producto creado:', response);
          this.mensajeExito = 'Producto creado correctamente';
          this.cerrarModal();
          this.cargarDatos();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('❌ Error al crear:', err);
          this.mensajeError = 'Error al crear el producto';
        }
      });
    }
  }

  validarFormulario(): boolean {
    this.mensajeError = '';
    
    if (!this.productoForm.nombre || this.productoForm.nombre.trim() === '') {
      this.mensajeError = 'El nombre es obligatorio';
      return false;
    }
    if (!this.productoForm.precio || this.productoForm.precio <= 0) {
      this.mensajeError = 'El precio debe ser mayor a 0';
      return false;
    }
    if (this.productoForm.stock === undefined || this.productoForm.stock < 0) {
      this.mensajeError = 'El stock no puede ser negativo';
      return false;
    }
    if (!this.categoriaSeleccionada || this.categoriaSeleccionada === 0) {
      this.mensajeError = 'Debes seleccionar una categoría';
      return false;
    }
    return true;
  }

  cambiarEstado(producto: Producto): void {
    const nuevoEstado = !producto.estado;
    
    this.http.put(`${this.apiUrl}/editar/${producto.id_producto}`, {
      estado: nuevoEstado
    }, { responseType: 'text' }).subscribe({
      next: () => {
        producto.estado = nuevoEstado;
        this.mensajeExito = `Producto ${nuevoEstado ? 'activado' : 'desactivado'}`;
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.mensajeError = 'Error al cambiar el estado';
      }
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Eliminar este producto?')) {
      this.http.delete(`${this.apiUrl}/eliminar/${id}`, {
        responseType: 'text'
      }).subscribe({
        next: () => {
          this.mensajeExito = 'Producto eliminado';
          this.cargarDatos();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.mensajeError = 'Error al eliminar el producto';
        }
      });
    }
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'badge bg-danger';
    if (stock < 10) return 'badge bg-warning text-dark';
    return 'badge bg-success';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return `Bajo: ${stock}`;
    return `${stock}`;
  }
}