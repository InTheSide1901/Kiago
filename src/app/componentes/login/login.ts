import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceAuth } from '../../service/serviceAuth/service-auth';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  loginData = {
    email: '',
    password_hash: ''
  };

  errorMessage = '';

  constructor(private authService: ServiceAuth, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.loginData).subscribe({
      next: () => {
        // Redirige al dashboard o vista protegida
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Correo o contraseña incorrectos';
      }
    });
  }
}
