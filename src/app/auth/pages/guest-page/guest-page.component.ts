import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-guest-page',
  templateUrl: './guest-page.component.html',
  styleUrls: ['./guest-page.component.css'],
  standalone: true,
  imports: [RouterModule] // Asegúrate de importar RouterModule para usar routerLink
})
export class GuestPageComponent {}

