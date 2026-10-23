import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service'; // Ajustá la ruta según tu proyecto

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  
  public authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout(); // Limpia localStorage, resetea la Signal y redirige a /login
  }
}