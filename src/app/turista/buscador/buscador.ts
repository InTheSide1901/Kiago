import { Component, inject, OnInit, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DatosService } from '../../service/serviceApp/service';
@Component({
  imports: [CommonModule],
  selector: 'app-buscador',
  styleUrl: './buscador.css',
  templateUrl: './buscador.html',
})
export class Buscador implements OnInit{
  private datosService = inject(DatosService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  private busquedaSubject = new Subject<string>();

  resultados = signal<any[]>([]);
  cargando = signal<boolean>(false);
  mostrarResultados = signal<boolean>(false);
  textoBusqueda = signal<string>('');

  ngOnInit() {
    this.busquedaSubject.pipe(
      debounceTime(300), // Espera 300ms a que el usuario deje de escribir
      distinctUntilChanged(), // No repite la llamada si el texto es idéntico
      switchMap((termino) => {
        if (!termino.trim()) {
          this.cargando.set(false);
          return [];
        }
        this.cargando.set(true);
        return this.datosService.buscarLocales(termino);
      })
    ).subscribe({
      next: (datos) => {
        this.resultados.set(datos);
        this.cargando.set(false);
        this.mostrarResultados.set(true);
      },
      error: (err) => {
        console.error('Error al buscar locales:', err);
        this.cargando.set(false);
      }
    });
  }

  onInput(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.textoBusqueda.set(valor);

    if (!valor.trim()) {
      this.resultados.set([]);
      this.mostrarResultados.set(false);
      return;
    }

    this.busquedaSubject.next(valor);
  }

  seleccionarLocal(local: any) {
    this.mostrarResultados.set(false);
    this.textoBusqueda.set('');
    this.router.navigate(['/inicio/categoria', local.categoria_id, 'detalle', local.id]);
  }

  // Cierra la lista si hacés click fuera del buscador
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.mostrarResultados.set(false);
    }
  }
}
