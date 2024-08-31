import { Component, OnInit } from '@angular/core';
import { RistoranteService } from '../../../../Services/Ristorante.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  cityName: string = '';

  constructor(private ristoranteService: RistoranteService) {}

  ngOnInit(): void {
    this.cityName = this.ristoranteService.getCityName();
  }
}
