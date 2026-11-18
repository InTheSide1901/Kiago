import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service';

/**
 * Registro exclusivo para administradores.
 * Usa el mismo endpoint `/api/auth/register` que cualquier usuario,
 * pero enviando `rol_id: 1`. Al terminar, el usuario inicia sesión
 * desde el login común de la app.
 */
@Component({
  selector: 'app-registro-admin',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md space-y-6">
        <h2 class="text-2xl font-bold text-center text-gray-900">Crear Cuenta de Administrador</h2>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                formControlName="nombre"
                class="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Diego">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                formControlName="apellido"
                class="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Pérez">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              formControlName="email"
              class="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              formControlName="password"
              class="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••">
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:bg-gray-400 transition">
            Registrarse
          </button>
        </form>

        <p class="text-sm text-center text-gray-600">
          ¿Ya tienes cuenta?
          <a routerLink="/login" class="text-emerald-600 hover:underline font-semibold">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
})
export class RegistroAdminComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, email, password } = this.registerForm.value;

    // Mismos campos que el registro normal + rol 1 (Administrador).
    this.authService.register({ nombre, apellido, email, password, rol_id: 1 }).subscribe({
      next: () => {
        alert('Cuenta de administrador creada. Ahora iniciá sesión con tus datos.');
        // Se limpia la sesión que genera el registro y se va al login común.
        this.authService.logout();
      },
      error: (err) => {
        console.error('Error en el registro del administrador:', err);
        alert(err?.error?.message || 'Error al registrar el administrador');
      },
    });
  }
}
