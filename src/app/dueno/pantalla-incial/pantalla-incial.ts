import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  imports: [CommonModule],
  selector: 'app-pantalla-incial',
  styleUrl: './pantalla-incial.css',
  templateUrl: './pantalla-incial.html',
})
export class PantallaIncial {
  constructor(private router: Router) {}

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
