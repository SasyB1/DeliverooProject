import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iSuggestion } from '../../../../Models/OSMSuggestion';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  searchQuery: string = '';
  suggestions: iSuggestion[] = [];
  userLat: number | null = null;
  userLon: number | null = null;

  constructor(private http: HttpClient) {}

  onInput(event: any): void {
    const query = event.target.value;

    if (query.length > 2) {
      this.http
        .get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`
        )
        .subscribe((results: any) => {
          this.suggestions = results;
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
    // Effettua la ricerca dei ristoranti nelle vicinanze
    this.searchAddress();
  }

  searchAddress(): void {
    if (this.userLat !== null && this.userLon !== null) {
      const maxDistanceKm = 10; // Esempio: 10 km di raggio
      this.http
        .get(`https://localhost:7223/vicini`, {
          params: {
            latitudine: this.userLat.toString(),
            longitudine: this.userLon.toString(),
            distanzaMassimaKm: maxDistanceKm.toString(),
          },
        })
        .subscribe((ristoranti: any) => {
          console.log('Ristoranti nelle vicinanze:', ristoranti);
          // Gestisci la lista dei ristoranti come preferisci
        });
    }
  }
}
