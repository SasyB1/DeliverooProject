import { CommonModule } from '@angular/common';
import { Component, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { iSuggestion } from '../../../../Models/OSMSuggestion';
import { RestaurantService } from '../../../../Services/Restaurant.service';

@Component({
  selector: 'app-dispay-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispay-window.component.html',
  styleUrls: ['./dispay-window.component.scss'],
})
export class DispayWindowComponent {
  ristoranti = computed(() => this.ristoranteService.ristoranti());
  searchQuery: string = '';
  suggestions: iSuggestion[] = [];
  userLat: number | null = null;
  userLon: number | null = null;

  constructor(private ristoranteService: RestaurantService) {
    this.ristoranteService.loadRistoranti();

    effect(() => {
      const ristoranti = this.ristoranti();
      console.log('Ristoranti ricevuti nel DispayWindowComponent:', ristoranti);
    });
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;

    if (query.length > 2) {
      this.ristoranteService.getSuggestions(query).subscribe({
        next: (results: iSuggestion[]) => {
          this.suggestions = results;
        },
        error: (error) => {
          console.error('Errore nella richiesta:', error);
          this.suggestions = [];
        },
      });
    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: iSuggestion): void {
    this.searchQuery = suggestion.display_name;
    this.userLat = parseFloat(suggestion.lat);
    this.userLon = parseFloat(suggestion.lon);
    this.suggestions = [];
    this.ristoranteService.setCityName(suggestion.display_name);
    this.searchAddress();
  }

  searchAddress(): void {
    if (this.userLat !== null && this.userLon !== null) {
      const maxDistanceKm = 10;
      this.ristoranteService
        .getRistoranti(this.userLat, this.userLon, maxDistanceKm)
        .subscribe({
          next: (ristoranti) => {
            console.log('Ristoranti nelle vicinanze:', ristoranti);
            this.ristoranteService.setRistoranti(ristoranti);
          },
          error: (error) => {
            console.error('Errore nella ricerca dei ristoranti:', error);
          },
        });
    }
  }
}
