
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router'; // <--- Importamos RouterLink
import { DatosService, MiDato } from '../../service/serviceApp/service';
@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-local',
  styleUrl: './local.css',
  templateUrl: './local.html',
})
export class Local implements OnInit{
  private datosService = inject(DatosService);
  private cdr = inject(ChangeDetectorRef);

  listaDatos: MiDato[] = [];
  cargando: boolean = true;

  nuevoNombre: string = '';
  editandoId: number | null = null;
  nombreEditado: string = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.datosService.getDatos().subscribe({
      next: (data) => {
        this.listaDatos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  agregar(): void {
    if (!this.nuevoNombre.trim()) return;
    this.datosService.crearDato(this.nuevoNombre).subscribe({
      next: () => {
        this.nuevoNombre = '';
        this.cargarDatos();
      }
    });
  }

  activarEdicion(event: Event, item: MiDato): void {
    event.stopPropagation(); // Evita redirigir al hacer clic en editar
    this.editandoId = item.id;
    this.nombreEditado = item.nombre;
  }

  cancelarEdicion(event?: Event): void {
    if (event) event.stopPropagation();
    this.editandoId = null;
    this.nombreEditado = '';
  }

  guardarEdicion(event: Event, id: number): void {
    event.stopPropagation();
    if (!this.nombreEditado.trim()) return;
    this.datosService.actualizarDato(id, this.nombreEditado).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarDatos();
      }
    });
  }

  eliminar(event: Event, id: number): void {
    event.stopPropagation(); // Evita redirigir al hacer clic en eliminar
    if (confirm('¿Deseas eliminar este registro de la base de datos?')) {
      this.datosService.eliminarDato(id).subscribe({
        next: () => {
          this.listaDatos = this.listaDatos.filter(item => item.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar el registro:', err);
        }
      });
    }
  }

}

