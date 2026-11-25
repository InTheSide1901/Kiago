import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminUsuariosService,
  DetalleUsuarioAdmin,
  UsuarioAdminItem,
} from '../service/admin-usuarios.service';

type FiltroRol = 'todos' | 'duenos' | 'turistas';

const FOTO_DEFAULT_S3 =
  'https://pruebaubicacion-332625613852-us-east-1-an.s3.us-east-1.amazonaws.com/foto_default/Default_pfp.jpg';

@Component({
  selector: 'app-admin-usuarios',
  imports: [DatePipe, FormsModule],
  templateUrl: './usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosComponent implements OnInit {
  private readonly usuariosService = inject(AdminUsuariosService);

  protected readonly usuarios = signal<UsuarioAdminItem[]>([]);
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string>('');
  protected readonly filtroRol = signal<FiltroRol>('todos');
  protected readonly busqueda = signal<string>('');

  protected readonly usuarioSeleccionado = signal<UsuarioAdminItem | null>(null);
  protected readonly detalleSeleccionado = signal<DetalleUsuarioAdmin | null>(null);
  protected readonly cargandoDetalle = signal<boolean>(false);

  protected readonly totalDuenos = computed(
    () => this.usuarios().filter((u) => u.rol_id === 2).length
  );

  protected readonly totalTuristas = computed(
    () => this.usuarios().filter((u) => u.rol_id === 3).length
  );

  protected readonly usuariosFiltrados = computed(() => {
    const rol = this.filtroRol();
    const q = this.busqueda().trim().toLowerCase();

    return this.usuarios().filter((u) => {
      if (rol === 'duenos' && u.rol_id !== 2) return false;
      if (rol === 'turistas' && u.rol_id !== 3) return false;

      if (!q) return true;
      const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
      return (
        nombreCompleto.includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.telefono || '').toLowerCase().includes(q)
      );
    });
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');

    this.usuariosService.obtenerUsuarios().subscribe({
      next: (res) => {
        this.usuarios.set(res.usuarios || []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error.set('No se pudieron cargar los usuarios desde el servidor.');
        this.cargando.set(false);
      },
    });
  }

  cambiarFiltroRol(rol: FiltroRol): void {
    this.filtroRol.set(rol);
  }

  verDetalle(usuario: UsuarioAdminItem): void {
    this.usuarioSeleccionado.set(usuario);
    this.detalleSeleccionado.set(null);
    this.cargandoDetalle.set(true);

    this.usuariosService.obtenerDetalleUsuario(usuario.id).subscribe({
      next: (detalle) => {
        this.detalleSeleccionado.set(detalle);
        this.cargandoDetalle.set(false);
      },
      error: (err) => {
        console.error('Error al cargar detalle del usuario:', err);
        this.cargandoDetalle.set(false);
      },
    });
  }

  cerrarDetalle(): void {
    this.usuarioSeleccionado.set(null);
    this.detalleSeleccionado.set(null);
  }

  avatarUrl(foto: string | null): string {
    return foto && foto.trim() ? foto : FOTO_DEFAULT_S3;
  }
}