import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

export interface Usuario {
  id: number;
  rol_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  foto_perfil: string | null;
  created_at: string;
}

export interface ActividadTuristaResponse {
  resumen: {
    favoritos: number;
    resenas: number;
    solicitudes: number;
  };
  ultimasResenas: Array<{
    id: number;
    puntuacion: number;
    comentario: string;
    created_at: string;
    local_nombre: string;
  }>;
  ultimasSolicitudes: Array<{
    id: number;
    nombre: string;
    estado: string;
    created_at: string;
  }>;
}

const FOTO_DEFAULT_S3 =
  'https://pruebaubicacion-332625613852-us-east-1-an.s3.us-east-1.amazonaws.com/foto_default/Default_pfp.jpg';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private apiBase = 'http://localhost:3000/api';

  usuario = signal<Usuario | null>(null);
  cargando = signal<boolean>(true);
  actividad = signal<ActividadTuristaResponse>({
    resumen: { favoritos: 0, resenas: 0, solicitudes: 0 },
    ultimasResenas: [],
    ultimasSolicitudes: [],
  });

  editando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  errorEdicion = signal<string>('');
  archivoSeleccionado = signal<File | null>(null);
  previewFoto = signal<string | null>(null);

  readonly fotoDefault = FOTO_DEFAULT_S3;

  editForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    telefono: [''],
  });

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarActividad();
  }

  private getAuthHeaders(): { headers?: HttpHeaders } {
    const token = localStorage.getItem('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  cargarDatosUsuario(): void {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        this.usuario.set(JSON.parse(usuarioStr));
      } catch (e) {
        console.error('Error al leer los datos del usuario:', e);
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<{ usuario: Usuario }>(`${this.apiBase}/auth/me`, this.getAuthHeaders()).subscribe({
        next: (res) => {
          if (res?.usuario) {
            this.usuario.set(res.usuario);
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
    } else {
      this.cargando.set(false);
    }
  }

  cargarActividad(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http
      .get<ActividadTuristaResponse>(`${this.apiBase}/auth/mi-actividad`, this.getAuthHeaders())
      .subscribe({
        next: (res) => {
          if (res) {
            this.actividad.set({
              resumen: res.resumen || { favoritos: 0, resenas: 0, solicitudes: 0 },
              ultimasResenas: res.ultimasResenas || [],
              ultimasSolicitudes: res.ultimasSolicitudes || [],
            });
          }
        },
        error: (err) => {
          console.error('Error al cargar actividad del turista:', err);
        },
      });
  }

  abrirEdicion(): void {
    const u = this.usuario();
    this.editForm.setValue({
      nombre: u?.nombre || '',
      apellido: u?.apellido || '',
      telefono: u?.telefono || '',
    });
    this.archivoSeleccionado.set(null);
    this.previewFoto.set(this.obtenerAvatar(u?.foto_perfil));
    this.errorEdicion.set('');
    this.editando.set(true);
  }

  cerrarEdicion(): void {
    if (this.guardando()) return;
    this.editando.set(false);
    this.archivoSeleccionado.set(null);
    this.previewFoto.set(null);
    this.errorEdicion.set('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorEdicion.set('Seleccioná un archivo de imagen válido.');
      return;
    }

    this.errorEdicion.set('');
    this.archivoSeleccionado.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewFoto.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  guardarPerfil(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorEdicion.set('No hay sesión activa.');
      return;
    }

    this.guardando.set(true);
    this.errorEdicion.set('');

    const { nombre, apellido, telefono } = this.editForm.value;
    const formData = new FormData();
    formData.append('nombre', (nombre || '').trim());
    formData.append('apellido', (apellido || '').trim());
    formData.append('telefono', (telefono || '').trim());

    const archivo = this.archivoSeleccionado();
    if (archivo) {
      formData.append('foto_perfil', archivo);
    }

    this.http
      .put<{ usuario: Usuario }>(`${this.apiBase}/auth/perfil`, formData, this.getAuthHeaders())
      .subscribe({
        next: (res) => {
          if (res?.usuario) {
            this.usuario.set(res.usuario);
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
          this.guardando.set(false);
          this.editando.set(false);
          this.archivoSeleccionado.set(null);
          this.previewFoto.set(null);
        },
        error: (err) => {
          console.error('Error al actualizar perfil:', err);
          this.errorEdicion.set(err.error?.message || 'No se pudo actualizar el perfil.');
          this.guardando.set(false);
        },
      });
  }

  obtenerAvatar(foto?: string | null): string {
    return foto && foto.trim() ? foto : this.fotoDefault;
  }

  obtenerNombreRol(rolId: number | undefined): string {
    switch (rolId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Dueño de Negocio';
      case 3:
        return 'Turista';
      default:
        return 'Usuario';
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}