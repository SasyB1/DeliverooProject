import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from './catalogoComponent/sidebar/sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { iRistorante } from '../../Models/Ristorante';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent implements OnInit {
  ristoranti: iRistorante[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.ristoranti = navigation.extras.state['ristoranti'] || [];
    }
  }
}
