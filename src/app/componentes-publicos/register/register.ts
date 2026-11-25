import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  cargando = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.cargando.set(true);

    const { nombre, apellido, email, telefono, password } = this.registerForm.value;
    const payload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      telefono: telefono?.trim() ? telefono.trim() : undefined,
      password,
      rol_id: 3,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/inicio/categoria']);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error en el registro:', err);
        this.errorMessage.set(err.error?.message || 'Error al registrar el usuario');
      },
    });
  }
}