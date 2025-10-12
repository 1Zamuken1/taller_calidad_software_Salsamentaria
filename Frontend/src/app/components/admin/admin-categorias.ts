import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categorias.html',
  styleUrls: ['./admin-categorias.css']
})
export class AdminCategoriasComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api/categorias';

  categorias: Categoria[] = [];
  loading: boolean = true;
  showModal: boolean = false;
  isEditing: boolean = false;
  
  mensajeExito: string = '';
  mensajeError: string = '';

  categoriaForm: Partial<Categoria> = {
    nombre: '',
    descripcion: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading = true;
    this.http.get<Categoria[]>(`${this.apiUrl}`).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.mensajeError = 'Error al cargar categorías';
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.categoriaForm = {
      nombre: '',
      descripcion: ''
    };
    this.showModal = true;
  }

  abrirModalEditar(categoria: Categoria): void {
    this.isEditing = true;
    this.categoriaForm = { ...categoria };
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.mensajeError = '';
  }

  guardarCategoria(): void {
    if (!this.validarFormulario()) {
      return;
    }

    if (this.isEditing && this.categoriaForm.id_categoria) {
      // Actualizar categoría existente
      this.http.put(`${this.apiUrl}/editar/${this.categoriaForm.id_categoria}`, this.categoriaForm, {
        responseType: 'text'
      }).subscribe({
        next: (response) => {
          this.mensajeExito = 'Categoría actualizada correctamente';
          this.cerrarModal();
          this.cargarCategorias();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('Error al actualizar categoría:', err);
          this.mensajeError = 'Error al actualizar la categoría';
        }
      });
    } else {
      // Crear nueva categoría
      this.http.post(`${this.apiUrl}/crear`, this.categoriaForm, {
        responseType: 'text'
      }).subscribe({
        next: (response) => {
          this.mensajeExito = 'Categoría creada correctamente';
          this.cerrarModal();
          this.cargarCategorias();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('Error al crear categoría:', err);
          this.mensajeError = 'Error al crear la categoría';
        }
      });
    }
  }

  validarFormulario(): boolean {
    if (!this.categoriaForm.nombre || this.categoriaForm.nombre.trim() === '') {
      this.mensajeError = 'El nombre es obligatorio';
      return false;
    }
    return true;
  }

  eliminarCategoria(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) {
      this.http.delete(`${this.apiUrl}/eliminar/${id}`, {
        responseType: 'text'
      }).subscribe({
        next: () => {
          this.mensajeExito = 'Categoría eliminada correctamente';
          this.cargarCategorias();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          console.error('Error al eliminar categoría:', err);
          this.mensajeError = 'Error al eliminar la categoría. Puede tener productos asociados.';
          setTimeout(() => this.mensajeError = '', 5000);
        }
      });
    }
  }
}