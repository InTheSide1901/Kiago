import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Usuario {
  id: number;
  rol_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  foto_perfil: string;
  created_at: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  usuario: Usuario | null = null;
  cargando: boolean = true;

  private router = inject(Router);

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
    } else {
      this.cargando = false;
    }
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
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}