import { Component, effect, OnInit } from '@angular/core';
import { RestaurantService } from '../../../../Services/Restaurant.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  cityName: string = '';

  constructor(private ristoranteService: RestaurantService) {
    effect(() => {
      this.cityName = this.ristoranteService.cityName();
    });
  }

  ngOnInit(): void {}
}
