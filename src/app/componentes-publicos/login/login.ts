import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/authService/auth-service';
@Component({
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      alert('Por favor, completa correctamente los campos.');
      return;
    }

    // Extraemos los valores directamente del formulario
    const datosLogin = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

   
    this.authService.login(datosLogin).subscribe({
      next: (respuesta) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

        const rol = respuesta.usuario.rol_id;

        // 3. Lo enviamos a la ruta que le corresponde según su rol
        if (rol === 1) {
          this.router.navigate(['/admin']); 
        } else if (rol === 2) {
          this.router.navigate(['/panel-dueno']); // 
        } else if (rol === 3) {
          this.router.navigate(['/inicio/categoria']); 
        }
      },
      error: (err) => {
        console.error(err);
        alert('Credenciales incorrectas');
      }
    });
  }
}
