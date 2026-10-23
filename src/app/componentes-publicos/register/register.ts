import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service';

@Component({
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, email, password } = this.registerForm.value;

    // Se envían los nombres de campos exactos que requiere el backend
    this.authService.register({ nombre, apellido, email, password }).subscribe({
      next: () => {
        this.router.navigate(['/inicio/categoria']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        alert(err.error?.message || 'Error al registrar el usuario');
      }
    });
  }
}

