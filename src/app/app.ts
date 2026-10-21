import { Component, inject, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { Navbar } from './componentes/navbar/navbar';
import { initFlowbite } from 'flowbite';
import { Header } from './componentes/header/header';

@Component({
  imports: [RouterOutlet,Header],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App{
  protected initializeFlowbite(): void {
    setTimeout(() => initFlowbite());
  }
}

