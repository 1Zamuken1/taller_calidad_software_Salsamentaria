import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}`);
  }

  crearCategoria(categoria: Partial<Categoria>): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/crear`, categoria);
  }

  actualizarCategoria(id: number, categoria: Partial<Categoria>): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/editar/${id}`, categoria);
  }

  eliminarCategoria(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/eliminar/${id}`);
  }
}