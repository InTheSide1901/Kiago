import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service';
@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-navbar-dueno',
  styleUrl: './navbar-dueno.css',
  templateUrl: './navbar-dueno.html',
})
export class NavbarDueno {
  public authService = inject(AuthService);
  public isMobileMenuOpen = false; // Variable para controlar el menú móvil

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onLogout(): void {
    this.closeMobileMenu();
    this.authService.logout(); 
  }
}
