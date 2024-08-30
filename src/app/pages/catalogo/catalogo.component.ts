import { Component } from '@angular/core';
import { SidebarComponent } from './catalogoComponent/sidebar/sidebar.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent {}
