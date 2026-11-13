import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ServiceSolicitudLocal } from '../../service/serviceSolicitudLocal/service-solicitud-local';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';


export interface Categoria {
  id: number;
  nombre: string;
  icono?: string;
}

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  selector: 'app-solicitud-local',
  styleUrl: './solicitud-local.css',
  templateUrl: './solicitud-local.html',
})

export class SolicitudLocal implements OnInit {
  registroForm!: FormGroup;
  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;

  // 1. Inicializamos el arreglo vacío
  categorias: Categoria[] = [];

  ciudades = [
    { id: 1, nombre: 'Ciudad Autónoma de Buenos Aires' }
  ];

  constructor(
    private fb: FormBuilder,
    private solicitudesService: ServiceSolicitudLocal,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      nombre_titular: ['', [Validators.required]], // <-- AÑADIDO
      apellido: ['', [Validators.required]],       // <-- AÑADIDO
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

    this.cargarCategorias();
  }

  // 3. Método que se suscribe al servicio para obtener los datos
  cargarCategorias(): void {
    this.solicitudesService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error al cargar las categorías:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      alert('Por favor, completá todos los campos obligatorios antes de enviar.');
      this.registroForm.markAllAsTouched();
      return;
    }

    if (!this.archivoSeleccionado) {
      alert('Por favor, seleccioná una foto principal para el local.');
      return;
    }

    // 1. Creamos el FormData para poder enviar archivos y texto mezclados
    const formData = new FormData();
    
    // 2. Extraemos todos los valores del formulario
    const formValues = this.registroForm.value;

    // 3. Recorremos los valores y los agregamos al FormData
    Object.keys(formValues).forEach(key => {
      // Si el campo no está vacío, lo adjuntamos
      if (formValues[key] !== null && formValues[key] !== '') {
        formData.append(key, formValues[key]);
      }
    });

    // 4. Adjuntamos el archivo físico con el nombre 'imagen' (el mismo que busca multer)
    formData.append('imagen', this.archivoSeleccionado);
    // 5. Enviamos la petición
    this.solicitudesService.enviarSolicitud(formData).subscribe({
      next: (respuesta) => {
        alert('¡Solicitud enviada con éxito! Está en estado pendiente de aprobación.');
        this.registroForm.reset();
        this.imagenPreview = null;
        this.archivoSeleccionado = null;
      },
      error: (error) => {
        console.error('Error del servidor:', error);
        alert('Hubo un error al enviar la solicitud. Revisá la consola.');
      }
    });
  }

  private map: any;
  public direccionBuscada: string = ''; // Vinculado al input del HTML
  private marcadorActual: any = null; // Para limpiar el pin anterior de búsqueda

  ngAfterViewInit(): void {
    // Aquí mantienes tu lógica actual de inicializar el mapa
  }

  // Función para convertir el texto en coordenadas reales
  public obtenerCoordenadas(): void {
    if (!this.direccionBuscada.trim()) return;

    // API gratuita de Nominatim (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.direccionBuscada)}`;

    this.http.get<any[]>(url).subscribe({
      next: (resultados) => {
        if (resultados && resultados.length > 0) {
          // Extraer latitud y longitud del primer resultado
          const lat = parseFloat(resultados[0].lat);
          const lng = parseFloat(resultados[0].lon);
          const direccionCompleta = resultados[0].display_name;

          console.log(`Coordenadas encontradas: Lat ${lat}, Lng ${lng}`);

          // 1. Centrar el mapa en las nuevas coordenadas obtenidas
          this.map.setView([lat, lng], 16);

          // 2. Limpiar el marcador anterior si el usuario hace varias búsquedas
          if (this.marcadorActual) {
            this.map.removeLayer(this.marcadorActual);
          }

          // 3. Crear un nuevo marcador y mostrar el popup con las coordenadas
          this.marcadorActual = L.marker([lat, lng]).addTo(this.map)
            .bindPopup(`
              <strong class="text-[#0b1329]">Coordenadas:</strong><br>
              <span class="text-[#5cb85c]">${lat}, ${lng}</span><br>
              <span class="text-xs text-gray-500">${direccionCompleta}</span>
            `)
            .openPopup();
        } else {
          alert('No se encontraron coordenadas para esta dirección.');
        }
      },
      error: (err) => console.error('Error buscando dirección:', err)
    });
  }
}
