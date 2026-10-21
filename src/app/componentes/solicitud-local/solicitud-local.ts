import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators,FormGroup } from '@angular/forms';
import { ServiceSolicitudLocal } from '../../service/serviceSolicitudLocal/service-solicitud-local'; // Asegurate de importar la ruta correcta

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-solicitud-local',
  styleUrl: './solicitud-local.css',
  templateUrl: './solicitud-local.html',
})
export class SolicitudLocal implements OnInit{
  registroForm!: FormGroup;

  // Agrega esta variable al inicio de tu clase, junto a tu FormGroup
imagenPreview: string | ArrayBuffer | null = null;
archivoSeleccionado: File | null = null; // Para guardar el archivo y luego enviarlo

// ... tu constructor y ngOnInit ...

// Agrega este método dentro de la clase
onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.archivoSeleccionado = file;
    
    // Si tienes el campo foto_principal en tu form, descomenta la siguiente línea:
    // this.registroForm.patchValue({ foto_principal: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

  categorias = [
    { id: 1, nombre: 'Gastronomía' },
    { id: 2, nombre: 'Hospedaje' }
  ];

  ciudades = [
    { id: 1, nombre: 'Ciudad Autónoma de Buenos Aires' }
  ];

  constructor(
    private fb: FormBuilder,
    private solicitudesService: ServiceSolicitudLocal
  ) {}

  ngOnInit(): void {
    // Quitamos la validación de la foto temporalmente de Angular para que no te bloquee el envío 
    // mientras nos concentramos en los datos de texto de la base de datos.
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      categoria_id: ['', Validators.required],
      descripcion: ['', Validators.required],
      telefono: ['', [Validators.required]],
      correo_electronico: ['', [Validators.required, Validators.email]],
      sitio_web: [''],
      ciudad_id: ['', Validators.required],
      calle: ['', [Validators.required]],
      altura: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required]
    });
  }

  onSubmit(): void {
    // Arreglo del botón: Si es inválido, avisamos al usuario y marcamos los campos en rojo
    if (this.registroForm.invalid) {
      alert('Por favor, completá todos los campos obligatorios antes de enviar.');
      this.registroForm.markAllAsTouched();
      return; 
    }

    // Armamos el payload plano tal cual las columnas de la tabla 'solicitudes_locales'
    const payload = {
      usuario_id: 1, // IMPORTANTE: Cambiar luego por el ID del usuario logueado en tu app
      nombre: this.registroForm.value.nombre,
      categoria_id: Number(this.registroForm.value.categoria_id),
      ciudad_id: Number(this.registroForm.value.ciudad_id),
      descripcion: this.registroForm.value.descripcion,
      telefono: this.registroForm.value.telefono,
      correo_electronico: this.registroForm.value.correo_electronico,
      sitio_web: this.registroForm.value.sitio_web,
      calle: this.registroForm.value.calle,
      altura: Number(this.registroForm.value.altura),
      latitud: parseFloat(this.registroForm.value.latitud),
      longitud: parseFloat(this.registroForm.value.longitud)
      // No mandamos el estado ni created_at, eso lo maneja Node.js / MySQL
    };

    console.log('Enviando datos al backend:', payload);

    // Llamamos al servicio
    this.solicitudesService.enviarSolicitud(payload).subscribe({
      next: (respuesta) => {
        alert('¡Solicitud enviada con éxito! Está en estado pendiente de aprobación.');
        this.registroForm.reset(); // Limpia el formulario
      },
      error: (error) => {
        console.error('Error del servidor:', error);
        alert('Hubo un error al enviar la solicitud. Revisá la consola.');
      }
    });
  }
}
