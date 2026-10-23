import { Component, OnInit, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ServiceComentario } from '../../service/serviceComentario/service-comentario';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-comentario',
  styleUrl: './comentario.css',
  templateUrl: './comentario.html',
})
export class Comentario implements OnInit {
 private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private comentariosService = inject(ServiceComentario);

  @Input() localId!: string | number;

  comentarioForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;

  // Manejo de edición
  modoEdicion = false;
  comentarioEdicionId: number | null = null;
  conservarImagen = true;

  // Estado del usuario e historial
  currentUserId: number | null = null;
  comentarioUsuarioExistente: any = null;

  comentariosList = signal<any[]>([]);
  cargandoComentarios = signal<boolean>(true);

  estrellas = [1, 2, 3, 4, 5];

  ngOnInit(): void {
  // Convertimos explícitamente a Number
  const usuarioStorage = localStorage.getItem('usuario');
  if (usuarioStorage) {
    const user = JSON.parse(usuarioStorage);
    this.currentUserId = user.id ? Number(user.id) : null;
  }

  if (!this.localId) {
    this.localId = this.route.snapshot.paramMap.get('id') || '';
  }

  this.initForm();

  if (this.localId) {
    this.obtenerComentarios();
  }
}

  initForm(): void {
    this.comentarioForm = this.fb.group({
      calificacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      contenido: ['', [Validators.maxLength(500)]]
    });
  }

  obtenerComentarios(): void {
  this.cargandoComentarios.set(true);
  this.comentariosService.getComentariosByLocalId(this.localId).subscribe({
    next: (data) => {      
      this.comentariosList.set(data);
      this.cargandoComentarios.set(false);

      if (this.currentUserId) {
        this.comentarioUsuarioExistente = data.find(
          (c: any) => Number(c.usuario_id || c.id_usuario) === Number(this.currentUserId)
        );
      }
    },
    error: (err) => {
      console.error('Error al cargar comentarios:', err);
      this.cargandoComentarios.set(false);
    }
  });
}
// Método auxiliar opcional para usar directamente en el HTML
esMiComentario(item: any): boolean {
  if (!item || !this.currentUserId) return false;
  // Compara evaluando tanto usuario_id como id_usuario
  const idComentarioUser = item.usuario_id ?? item.id_usuario;
  return Number(idComentarioUser) === Number(this.currentUserId);
}

  setRating(valor: number): void {
    this.comentarioForm.patchValue({ calificacion: valor });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB.');
        return;
      }

      this.selectedFile = file;
      this.conservarImagen = false;

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.conservarImagen = false;
  }

  // Cargar datos en el formulario para editar
  prepararEdicion(item: any): void {
    this.modoEdicion = true;
    this.comentarioEdicionId = item.id;
    this.comentarioForm.patchValue({
      calificacion: item.puntuacion,
      contenido: item.comentario
    });
    this.imagePreview = item.url_imagen || null;
    this.conservarImagen = true;
    this.selectedFile = null;

    
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.comentarioEdicionId = null;
    this.comentarioForm.reset({ calificacion: 0, contenido: '' });
    this.removeImage();
  }

  confirmarEliminacion(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar tu reseña?')) {
      this.comentariosService.eliminarComentario(id).subscribe({
        next: () => {
          alert('Reseña eliminada correctamente.');
          if (this.modoEdicion && this.comentarioEdicionId === id) {
            this.cancelarEdicion();
          }
          this.obtenerComentarios();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('No se pudo eliminar el comentario.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('localId', String(this.localId));
    formData.append('calificacion', this.comentarioForm.get('calificacion')?.value);
    formData.append('contenido', this.comentarioForm.get('contenido')?.value || '');
    formData.append('conservarImagen', String(this.conservarImagen));

    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    if (this.modoEdicion && this.comentarioEdicionId) {
      // MODO EDICIÓN
      this.comentariosService.actualizarComentario(this.comentarioEdicionId, formData).subscribe({
        next: () => {
          alert('¡Comentario actualizado con éxito!');
          this.cancelarEdicion();
          this.isSubmitting = false;
          this.obtenerComentarios();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('No se pudo actualizar la opinión.');
          this.isSubmitting = false;
        }
      });
    } else {
      // MODO CREACIÓN
      this.comentariosService.crearComentario(formData).subscribe({
        next: () => {
          alert('¡Comentario publicado con éxito!');
          this.comentarioForm.reset({ calificacion: 0, contenido: '' });
          this.removeImage();
          this.isSubmitting = false;
          this.obtenerComentarios();
        },
        error: (err) => {
          this.isSubmitting = false;
          if (err.error?.code === 'COMMENT_EXISTS') {
            alert(err.error.message);
          } else {
            alert('Ocurrió un error al publicar el comentario.');
          }
        }
      });
    }
  }
}