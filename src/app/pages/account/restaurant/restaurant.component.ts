import { Component, OnInit, signal } from '@angular/core';
import { iOpeningHours } from '../../../Models/OpeningHours';
import { iSuggestion } from '../../../Models/OSMSuggestion';
import { iRestaurant } from '../../../Models/Restaurant';
import { RestaurantService } from '../../../Services/Restaurant.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  editSuggestions: iSuggestion[] = [];
  selectedLat: number | null = null;
  selectedLon: number | null = null;
  imageFile?: File;
  daysOfWeek: string[] = [
    'Domenica',
    'Lunedì',
    'Martedì',
    'Mercoledì',
    'Giovedì',
    'Venerdì',
    'Sabato',
  ];

  ristoranti = signal<iRestaurant[]>([]);

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user && user.iD_Utente) {
        this.newRestaurant.ID_Utente = user.iD_Utente;
        this.getRestaurantsByUser(user.iD_Utente);
      } else {
        console.error('ID utente non trovato nel localStorage');
      }
    } else {
      console.error('Nessun utente salvato nel localStorage');
    }
  }

  getRestaurantsByUser(iD_Utente: number): void {
    this.restaurantService.getRestaurantsByUser(iD_Utente).subscribe({
      next: (ristoranti: iRestaurant[]) => {
        console.log('Ristoranti ottenuti con orari di apertura:', ristoranti);
        this.ristoranti.set(ristoranti);
      },
      error: (error) => {
        console.error('Errore nel recupero dei ristoranti:', error);
      },
    });
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
      ID_OrarioApertura: 0,
      giornoSettimana: index,
      oraApertura: '09:00',
      oraChiusura: '21:00',
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
          this.ristoranti.update((currentRistoranti: iRestaurant[]) => {
            const updatedRistoranti = [...currentRistoranti, response];
            console.log('Ristoranti aggiornati:', updatedRistoranti);
            return updatedRistoranti;
          });
          this.resetForm();
        },
        error: (error) => {
          console.error('Errore nella creazione del ristorante:', error);
        },
      });
  }

  resetForm(): void {
    this.newRestaurant = {
      nome: '',
      indirizzo: '',
      telefono: '',
      email: '',
      immaginePath: '',
      ID_Utente: this.newRestaurant.ID_Utente,
      latitudine: 0,
      longitudine: 0,
      orariApertura: this.getEmptyOrariApertura(),
    };
    this.imageFile = undefined;
    this.searchQuery = '';
  }
  getImageUrl(immaginePath: string | null): string {
    return this.restaurantService.getImageUrl(immaginePath);
  }
  navigateToDetails(restaurantId?: number): void {
    if (restaurantId) {
      this.router.navigate([`/account/restaurant/details`, restaurantId]);
    } else {
      console.error('ID del ristorante non trovato');
    }
  }
  updateRistorante(ristorante: iRestaurant): void {
    if (!ristorante.orariApertura || ristorante.orariApertura.length === 0) {
      ristorante.orariApertura = this.getEmptyOrariApertura();
    }

    const fileToUpload = this.imageFile ? this.imageFile : undefined;

    this.restaurantService
      .updateRestaurant(ristorante, fileToUpload)
      .subscribe({
        next: (updatedRestaurant) => {
          console.log('Ristorante aggiornato:', updatedRestaurant);
          this.ristoranti.update((currentRistoranti: iRestaurant[]) => {
            return currentRistoranti.map((r) =>
              r.iD_Ristorante === updatedRestaurant.iD_Ristorante
                ? updatedRestaurant
                : r
            );
          });
          this.imageFile = undefined;
        },
        error: (error) => {
          console.error("Errore nell'aggiornamento del ristorante:", error);
        },
      });
  }

  onInputEdit(event: Event, ristorante: iRestaurant): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;

    if (query.length > 2) {
      this.restaurantService.getSuggestions(query).subscribe({
        next: (results: iSuggestion[]) => {
          this.editSuggestions = results;
        },
        error: (error) => {
          console.error('Errore nella richiesta:', error);
          this.editSuggestions = [];
        },
      });
    } else {
      this.editSuggestions = [];
    }
  }
  selectEditSuggestion(suggestion: iSuggestion, ristorante: iRestaurant): void {
    ristorante.indirizzo = suggestion.display_name;
    ristorante.latitudine = parseFloat(suggestion.lat);
    ristorante.longitudine = parseFloat(suggestion.lon);
    this.editSuggestions = [];
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }
}
