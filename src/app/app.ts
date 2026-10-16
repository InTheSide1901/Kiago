import { Component} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ServiceAuth } from './service/serviceAuth/service-auth';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App{
  constructor(public authService: ServiceAuth) {}
}
