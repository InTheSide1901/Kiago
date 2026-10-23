import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from './turista/navbar/navbar';
import { initFlowbite } from 'flowbite';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Header } from './turista/header/header';
import { Footer } from './turista/footer/footer';

@Component({
  imports: [RouterOutlet, CommonModule, Header, Footer], // <-- Se eliminaron los comentarios y se agregaron los componentes
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {

  private router = inject(Router);
  
  // Variable que controla si se ven el header y el footer
  mostrarLayout: boolean = true;

  constructor() {
    // Escuchamos los cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      // Lista de rutas donde NO queremos que aparezca el header/footer
      const rutasOcultas = ['/login', '/register', '/admin', '/panel-dueno'];
      
      // Verifica si la URL actual contiene alguna de las rutas prohibidas
      this.mostrarLayout = !rutasOcultas.some(ruta => event.url.includes(ruta));
    });
  }

  protected initializeFlowbite(): void {
    setTimeout(() => initFlowbite());
  }
}