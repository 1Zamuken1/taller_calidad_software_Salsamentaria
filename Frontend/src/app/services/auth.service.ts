import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AuthResponse {
  token: string;
  id?: number;
  nombre?: string;
  email?: string;
  rol?: string; // ← AGREGAR
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  nombre?: string;
  id?: number;
}

interface CurrentUser {
  id: number;
  email: string;
  nombre: string;
  token: string;
  rol: string; // ← AGREGAR
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.cargarUsuarioDelStorage();
  }

  private cargarUsuarioDelStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error al cargar usuario del storage:', error);
        this.logout();
      }
    }
  }

  registerWithRequest(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          this.procesarRespuestaAuth(response, request.nombre, request.email);
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response: AuthResponse) => {
          if (response.token) {
            this.procesarRespuestaAuth(response, response.nombre, email);
          }
        })
      );
  }

  register(nombre: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { nombre, email, password })
      .pipe(
        tap((response: AuthResponse) => {
          if (response.token) {
            this.procesarRespuestaAuth(response, nombre, email);
          }
        })
      );
  }

  private procesarRespuestaAuth(response: AuthResponse, nombre?: string, email?: string): void {
    localStorage.setItem('token', response.token);

    const payload = this.decodificarToken(response.token);
    
    const currentUser: CurrentUser = {
      id: response.id || payload.id || 0,
      email: email || payload.sub || '',
      nombre: nombre || response.nombre || payload.nombre || '',
      token: response.token,
      rol: response.rol || 'CLIENTE' // ← AGREGAR con valor por defecto
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('nombreUsuario', currentUser.nombre);
    
    this.currentUserSubject.next(currentUser);
  }

  private decodificarToken(token: string): JwtPayload {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return { sub: '', exp: 0, iat: 0 };
    }
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  // ⭐ NUEVO: Verificar si es admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'ADMIN';
  }

  // ⭐ NUEVO: Obtener rol del usuario
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.rol || null;
  }

  obtenerEmailDelToken(): string | null {
    const token = this.obtenerToken();
    if (!token) return null;
    
    try {
      const payload = this.decodificarToken(token);
      return payload.sub;
    } catch (error) {
      return null;
    }
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  eliminarToken(): void {
    localStorage.removeItem('token');
  }

  guardarNombreUsuario(nombre: string): void {
    localStorage.setItem('nombreUsuario', nombre);
  }

  obtenerNombreUsuario(): string | null {
    const user = this.getCurrentUser();
    return user?.nombre || localStorage.getItem('nombreUsuario');
  }

  eliminarNombreUsuario(): void {
    localStorage.removeItem('nombreUsuario');
  }

  logout(): void {
    this.eliminarToken();
    this.eliminarNombreUsuario();
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodificarToken(token);
      const expiracion = payload.exp * 1000;
      return Date.now() > expiracion;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return true;
    }
  }
}