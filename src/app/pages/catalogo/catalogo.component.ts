import { Component, computed, effect } from '@angular/core';
import { SidebarComponent } from './catalogoComponent/sidebar/sidebar.component';
import { RistoranteService } from '../../Services/Ristorante.service';
import { iRistorante } from '../../Models/Ristorante';
import { CommonModule } from '@angular/common';
import { DispayWindowComponent } from './catalogoComponent/dispay-window/dispay-window.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [SidebarComponent, DispayWindowComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
})
export class CatalogoComponent {}
