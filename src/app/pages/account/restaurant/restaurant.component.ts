import { Component, OnInit } from '@angular/core';
import { iOpeningHours } from '../../../Models/OpeningHours';
import { iSuggestion } from '../../../Models/OSMSuggestion';
import { iRestaurant } from '../../../Models/Restaurant';
import { RestaurantService } from '../../../Services/Restaurant.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.scss',
})
export class RestaurantComponent implements OnInit {
  newRestaurant: iRestaurant = {
    nome: '',
    indirizzo: '',
    telefono: '',
    email: '',
    immaginePath: '',
    ID_Utente: 0,
    latitudine: 0,
    longitudine: 0,
    orariApertura: this.getEmptyOrariApertura(),
  };
  searchQuery: string = '';
  suggestions: iSuggestion[] = [];
  selectedLat: number | null = null;
  selectedLon: number | null = null;
  imageFile?: File;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user && user.iD_Utente) {
        this.newRestaurant.ID_Utente = user.iD_Utente;
      } else {
        console.error('ID utente non trovato nel localStorage');
      }
    } else {
      console.error('Nessun utente salvato nel localStorage');
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;

    if (query.length > 2) {
      this.restaurantService.getSuggestions(query).subscribe({
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
    this.newRestaurant.indirizzo = suggestion.display_name;
    this.newRestaurant.latitudine = parseFloat(suggestion.lat);
    this.newRestaurant.longitudine = parseFloat(suggestion.lon);
    this.suggestions = [];
  }

  getEmptyOrariApertura(): iOpeningHours[] {
    return Array.from({ length: 7 }, (_, index) => ({
      giornoSettimana: index,
      oraApertura: '09:00',
      oraChiusura: '15:00',
    }));
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
    }
  }

  createRestaurant(): void {
    console.log(
      'Orari di Apertura JSON:',
      JSON.stringify(this.newRestaurant.orariApertura)
    );
    this.restaurantService
      .createRestaurant(this.newRestaurant, this.imageFile)
      .subscribe({
        next: (response) => {
          console.log('Ristorante creato con successo:', response);
        },
        error: (error) => {
          console.error('Errore nella creazione del ristorante:', error);
        },
      });
  }
}
