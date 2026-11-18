import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { PerfilDueñoService } from '../services/service-perfil/perfil-service'; // Ajusta tu ruta de servicio
import { NavbarDueno } from '../navbar-dueno/navbar-dueno';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NavbarDueno],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  private timerDatos: any;
  private timerPass: any;
  datosForm!: FormGroup;
  seguridadForm!: FormGroup;

  modoEdicion = false;
  mostrarPassActual = false;
  mostrarPassNueva = false;
  mostrarPassConfirmar = false;

  // Estados para el Modal de confirmación
  mostrarModalPassword = false;
  textoConfirmacion = '';
  fraseEsperada = 'Cambiar contraseña permanentemente';

  mensajeExitoDatos = '';
  mensajeErrorDatos = '';
  mensajeExitoPass = '';
  mensajeErrorPass = '';

  usuarioOriginal = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  };

  constructor(private fb: FormBuilder, private perfilService: PerfilDueñoService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDatosDesdeBD();
  }

  private inicializarFormularios(): void {
    this.datosForm = this.fb.group({
      nombre: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      apellido: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: [{ value: '', disabled: true }, [Validators.required]]
    });

    this.seguridadForm = this.fb.group(
      {
        passActual: ['', [Validators.required]],
        passNueva: ['', [Validators.required, Validators.minLength(8)]],
        passConfirmar: ['', [Validators.required]]
      },
      { validators: this.validarPasswordsIguales }
    );
  }

  cargarDatosDesdeBD(): void {
    this.perfilService.obtenerPerfil().subscribe({
      next: (res: any) => {
        const datosUsuario = res.usuario || res; 
        this.usuarioOriginal = {
          nombre: datosUsuario.nombre || '',
          apellido: datosUsuario.apellido || '',
          email: datosUsuario.email || '',
          telefono: datosUsuario.telefono || ''
        };
        this.datosForm.patchValue(this.usuarioOriginal);
      },
      error: (err) => {
        console.error('Error al obtener el perfil:', err);
      }
    });
  }

  private validarPasswordsIguales(control: AbstractControl): ValidationErrors | null {
    const nueva = control.get('passNueva')?.value;
    const confirmar = control.get('passConfirmar')?.value;
    return nueva && confirmar && nueva !== confirmar ? { noCoinciden: true } : null;
  }

  activarEdicion(): void {
    this.modoEdicion = true;
    this.datosForm.enable();        
    this.datosForm.get('email')?.disable(); 

    this.mensajeExitoDatos = '';
    this.mensajeErrorDatos = '';
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.datosForm.reset(this.usuarioOriginal);
    this.datosForm.disable();
  }

  guardarDatosPersonales(): void {
    if (this.datosForm.invalid) {
      this.datosForm.markAllAsTouched();
      return;
    }

    const payload = this.datosForm.getRawValue();

    this.perfilService.actualizarDatos(payload).subscribe({
      next: (res: any) => {
        this.usuarioOriginal = { ...payload };
        this.modoEdicion = false;
        this.datosForm.disable();
        
        this.mensajeExitoDatos = res.mensaje || 'Datos actualizados con éxito.';
        this.mensajeErrorDatos = '';

        // Limpiamos un timer anterior si existía
        if (this.timerDatos) clearTimeout(this.timerDatos);

        this.timerDatos = setTimeout(() => {
          this.mensajeExitoDatos = '';
          this.cdr.detectChanges(); // <-- Forzamos a Angular a redibujar la vista para los datos personales
        }, 5000);
      },
      error: (err) => {
        this.mensajeErrorDatos = err.error?.error || 'Error al actualizar los datos.';
      }
    });
  } 

  // 1. Paso previo: valida el formulario y abre el modal
  solicitarCambioPassword(): void {
    if (this.seguridadForm.invalid) {
      this.seguridadForm.markAllAsTouched();
      return;
    }
    this.textoConfirmacion = '';
    this.mostrarModalPassword = true;
    this.mensajeExitoPass = '';
    this.mensajeErrorPass = '';
  }

  // 2. Paso final: Se ejecuta cuando se escribe la frase correcta y se presiona confirmar en el modal
  ejecutarCambioPassword(): void {
    if (this.textoConfirmacion !== this.fraseEsperada) return;

    const { passActual, passNueva } = this.seguridadForm.value;

    this.perfilService.actualizarContrasena({ passActual, passNueva }).subscribe({
      next: (res: any) => {
        this.mensajeExitoPass = res.mensaje || 'Contraseña actualizada con éxito.';
        this.mensajeErrorPass = '';
        
        this.seguridadForm.reset();
        this.cerrarModal();

        if (this.timerPass) clearTimeout(this.timerPass);

        this.timerPass = setTimeout(() => {
          this.mensajeExitoPass = '';
          this.cdr.detectChanges(); // <-- Forzamos a Angular a redibujar la vista
        }, 5000);
      },
      error: (err) => {
        this.mensajeErrorPass = err.error?.error || 'Error al cambiar la contraseña.';
        this.cerrarModal();
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModalPassword = false;
    this.textoConfirmacion = '';
  }
}