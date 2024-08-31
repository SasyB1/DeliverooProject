import { CommonModule } from '@angular/common';
import { Component, computed, effect } from '@angular/core';
import { RistoranteService } from '../../../../Services/Ristorante.service';

@Component({
  selector: 'app-dispay-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dispay-window.component.html',
  styleUrls: ['./dispay-window.component.scss'],
})
export class DispayWindowComponent {
  ristoranti = computed(() => this.ristoranteService.ristoranti());

  constructor(private ristoranteService: RistoranteService) {
    this.ristoranteService.loadRistoranti();

    effect(() => {
      const ristoranti = this.ristoranti();
      console.log('Ristoranti ricevuti nel CatalogoComponent:', ristoranti);
    });
  }
}
