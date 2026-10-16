
import {Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-new',
  styleUrl: './new.css',
  templateUrl: './new.html',
})
export class New {
  localForm: FormGroup;
  selectedFile: File | null = null;
  cargando = false;
  respuestaExitosa: any = null;
  errorMensaje: string | null = null;

  private apiUrl = 'http://localhost:3000/api/datos';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.localForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  // Captura el archivo cuando el usuario lo selecciona
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // Enviar formulario al servidor
  onSubmit(): void {
    if (this.localForm.invalid || !this.selectedFile) {
      this.errorMensaje = 'Por favor completa el nombre y selecciona una imagen.';
      return;
    }

    this.cargando = true;
    this.errorMensaje = null;
    this.respuestaExitosa = null;

    // Crear FormData para enviar multipart/form-data
    const formData = new FormData();
    formData.append('nombre', this.localForm.get('nombre')?.value);
    formData.append('imagen', this.selectedFile);

    this.http.post(this.apiUrl, formData).subscribe({
      next: (res) => {
        this.respuestaExitosa = res;
        this.cargando = false;
        this.localForm.reset();
        this.selectedFile = null;
      },
      error: (err) => {
        console.error(err);
        this.errorMensaje = err.error?.error || 'Error al conectar con el servidor';
        this.cargando = false;
      }
    });
  }
}
