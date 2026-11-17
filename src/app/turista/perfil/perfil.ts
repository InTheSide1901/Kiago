import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaVisitas } from '../agenda-visitas/agenda-visitas';
import { ServicePerfil, Usuario } from '../../service/servicePerfil/service-perfil';
import { AuthService } from '../../service/authService/auth-service';

@Component({
  imports: [CommonModule, FormsModule, AgendaVisitas],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  usuario: Usuario | null = null;
  cargando: boolean = true;
  modalEdicionAbierto = false;
  guardando = false;
  errorEdicion = '';
  nombreEdicion = '';
  apellidoEdicion = '';
  telefonoEdicion = '';
  fotoBase64: string | null = null;
  vistaPreviaFoto: string | null = null;

  private servicePerfil = inject(ServicePerfil);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    // Leemos el string JSON guardado en la clave 'usuario' al iniciar sesión
    const usuarioStr = localStorage.getItem('usuario');
    
    if (usuarioStr) {
      try {
        // Convertimos el texto a un objeto y se lo asignamos a la vista
        this.usuario = JSON.parse(usuarioStr);
        this.cargando = false;
      } catch (e) {
        console.error('Error al leer los datos del usuario:', e);
        this.cargando = false;
      }
    }

    if (!localStorage.getItem('token')) {
      this.cargando = false;
      return;
    }

    // Renueva la URL temporal de S3 para que la imagen privada vuelva a cargar.
    this.servicePerfil.obtenerMiPerfil().subscribe({
      next: respuesta => {
        this.usuario = respuesta.usuario;
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        this.authService.currentUser.set(respuesta.usuario);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  obtenerNombreRol(rolId: number | undefined): string {
    if (!rolId) return 'Usuario';
    const roles: { [key: number]: string } = {
      1: 'Turista',
      2: 'Dueño de Negocio',
      3: 'Administrador'
    };
    return roles[rolId] || 'Usuario';
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  abrirEdicion(): void {
    if (!this.usuario) return;
    this.nombreEdicion = this.usuario.nombre || '';
    this.apellidoEdicion = this.usuario.apellido || '';
    this.telefonoEdicion = this.usuario.telefono || '';
    this.fotoBase64 = null;
    this.vistaPreviaFoto = this.usuario.foto_perfil || null;
    this.errorEdicion = '';
    this.modalEdicionAbierto = true;
  }

  cancelarEdicion(): void {
    if (!this.guardando) this.modalEdicionAbierto = false;
  }

  usarLogoComoFotoAlternativa(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    if (!imagen.src.endsWith('/images/LogoSinFondo-256.png')) {
      imagen.src = '/images/LogoSinFondo-256.png';
    }
  }

  seleccionarFoto(event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      this.errorEdicion = 'La foto debe ser JPG, PNG o WEBP.';
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      this.errorEdicion = 'La foto no puede superar los 5 MB.';
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === 'string') {
        this.fotoBase64 = lector.result;
        this.vistaPreviaFoto = lector.result;
        this.errorEdicion = '';
        this.cdr.markForCheck();
      }
    };
    lector.onerror = () => {
      this.errorEdicion = 'No se pudo leer la foto seleccionada.';
      this.cdr.markForCheck();
    };
    lector.readAsDataURL(archivo);
  }

  guardarPerfil(): void {
    if (!this.usuario || this.guardando) return;
    const nombre = this.nombreEdicion.trim();
    const apellido = this.apellidoEdicion.trim();
    const telefono = this.telefonoEdicion.trim();

    if (!nombre || !apellido) {
      this.errorEdicion = 'Nombre y apellido son obligatorios.';
      return;
    }
    if (nombre.length > 100 || apellido.length > 100 || telefono.length > 30) {
      this.errorEdicion = 'Revisa el largo de los campos: nombre y apellido hasta 100, teléfono hasta 30 caracteres.';
      return;
    }

    const datos: { nombre: string; apellido: string; telefono: string | null; foto_perfil?: string } = {
      nombre,
      apellido,
      telefono: telefono || null
    };
    if (this.fotoBase64) datos.foto_perfil = this.fotoBase64;

    this.guardando = true;
    this.errorEdicion = '';
    this.servicePerfil.actualizarPerfil(datos).subscribe({
      next: respuesta => {
        this.usuario = respuesta.usuario;
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        this.authService.currentUser.set(respuesta.usuario);
        this.modalEdicionAbierto = false;
        this.guardando = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.errorEdicion = error.error?.mensaje || error.error?.message || this.obtenerMensajeError(error.status);
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }

  private obtenerMensajeError(status: number): string {
    if (status === 0) return 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    if (status === 413) return 'La solicitud es demasiado grande. La foto debe pesar menos de 5 MB.';
    if (status === 401) return 'Tu sesión venció. Cierra sesión e inicia nuevamente.';
    if (status === 404) return 'No se encontró el usuario asociado a esta sesión.';
    return 'No se pudo actualizar el perfil. Revisa el backend y vuelve a intentarlo.';
  }
}
