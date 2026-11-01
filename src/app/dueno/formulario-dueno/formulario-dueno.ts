import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ServiceSolicitudLocal } from '../../service/serviceSolicitudLocal/service-solicitud-local';
import { AuthService } from '../../service/authService/auth-service'; // Ajusta la ruta a tu servicio de auth

export interface Categoria {
  id: number;
  nombre: string;
  icono?: string;
}
@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-formulario-dueno',
  styleUrl: './formulario-dueno.css',
  templateUrl: './formulario-dueno.html',
})
export class FormularioDueno implements OnInit {
  registroForm!: FormGroup;
  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;

  categorias: Categoria[] = [];
  ciudades = [{ id: 1, nombre: 'Ciudad Autónoma de Buenos Aires' }];

  constructor(
    private fb: FormBuilder,
    private solicitudesService: ServiceSolicitudLocal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Obtener usuario autenticado
    const usuarioLogueado = this.authService.getUsuario(); 

    // 2. Formulario con campos de titular precargados y deshabilitados
    this.registroForm = this.fb.group({
      usuario_id: [usuarioLogueado?.id || '', Validators.required],
      nombre_titular: [{ value: usuarioLogueado?.nombre || '', disabled: true }, [Validators.required]],
      apellido: [{ value: usuarioLogueado?.apellido || '', disabled: true }, [Validators.required]],
      correo_electronico: [{ value: usuarioLogueado?.email || '', disabled: true }, [Validators.required, Validators.email]],
      
      // Campos editables del local
      nombre: ['', [Validators.required]],
      categoria_id: ['', Validators.required],
      descripcion: ['', Validators.required],
      telefono: [usuarioLogueado?.telefono || '', [Validators.required]],
      sitio_web: [''],
      ciudad_id: ['', Validators.required],
      calle: ['', [Validators.required]],
      altura: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required]
    });

    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.solicitudesService.getCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagenPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      alert('Por favor, completá todos los campos obligatorios.');
      this.registroForm.markAllAsTouched();
      return;
    }

    if (!this.archivoSeleccionado) {
      alert('Por favor, seleccioná una foto principal para el local.');
      return;
    }

    // Usar getRawValue() para incluir los campos deshabilitados (nombre, apellido, correo)
    const formValues = this.registroForm.getRawValue();
    const formData = new FormData();

    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== null && formValues[key] !== '') {
        formData.append(key, formValues[key]);
      }
    });

    formData.append('imagen', this.archivoSeleccionado);

    this.solicitudesService.enviarSolicitud(formData).subscribe({
      next: () => {
        alert('¡Solicitud de nuevo local enviada con éxito!');
        // Mantiene precargados los datos del titular al resetear
        const usuarioLogueado = this.authService.getUsuario();
        this.registroForm.reset({
          usuario_id: usuarioLogueado?.id,
          nombre_titular: usuarioLogueado?.nombre,
          apellido: usuarioLogueado?.apellido,
          correo_electronico: usuarioLogueado?.email
        });
        this.imagenPreview = null;
        this.archivoSeleccionado = null;
      },
      error: (error) => {
        console.error('Error al enviar la solicitud:', error);
        alert('Hubo un error al enviar la solicitud.');
      }
    });
  }
}
