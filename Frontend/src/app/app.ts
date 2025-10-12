import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <!-- Header visible solo para rutas de usuario (no admin, no login/register) -->
    <app-header *ngIf="mostrarHeader()"></app-header>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'salsamentaria-frontend';

  constructor(public router: Router) {}

  mostrarHeader(): boolean {
    const ruta = this.router.url;

    // 🔹 Rutas donde el header NO debe mostrarse
    const rutasExcluidas = ['/login', '/register'];

    // 1️⃣ Excluir rutas específicas (login, register)
    if (rutasExcluidas.some(r => ruta.startsWith(r))) {
      return false;
    }

    // 2️⃣ Excluir todo lo que empiece con "/admin"
    if (ruta.startsWith('/admin')) {
      return false;
    }

    // ✅ En cualquier otra ruta, mostrar el header
    return true;
  }
}
