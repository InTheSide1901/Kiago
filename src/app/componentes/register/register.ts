import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ServiceAuth } from '../../service/serviceAuth/service-auth';


@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  registerData = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: ''
  };

  errorMessage = '';

  constructor(private authService: ServiceAuth, private router: Router) { }

  onSubmit() {
    this.errorMessage = '';

    this.authService.registrar(this.registerData).subscribe({
      next: () => {
        // Redirige al main tras registrarse
        this.router.navigate(['/inicio/categoria']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al crear la cuenta';
      }
    });
  }
}
