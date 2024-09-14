import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
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
export class DispayWindowComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollableDiv') scrollableDiv!: ElementRef;
  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  ristoranti = computed(() => this.ristoranteService.ristoranti());
  searchQuery: string = '';
  suggestions: iSuggestion[] = [];
  userLat: number | null = null;
  userLon: number | null = null;
  cityName: string = '';

  constructor(private ristoranteService: RestaurantService) {
    const savedLat = localStorage.getItem('userLat');
    const savedLon = localStorage.getItem('userLon');
    if (savedLat && savedLon) {
      this.userLat = parseFloat(savedLat);
      this.userLon = parseFloat(savedLon);
      console.log('Coordinate utente recuperate:', this.userLat, this.userLon);
    } else {
      console.log('Nessuna coordinata salvata trovata');
    }

    effect(() => {
      this.cityName = this.ristoranteService.getCityName();
      console.log('City name aggiornato:', this.cityName);
    });
    this.ristoranteService.loadRistoranti();

    effect(() => {
      const ristorantiFiltrati = this.ristoranti();
      console.log('Ristoranti filtrati ricevuti:', ristorantiFiltrati);
      ristorantiFiltrati.forEach((r) => console.log(r.immaginePath));
    });

    effect(
      () => {
        const selectedCategories = this.ristoranteService.selectedCategories();
        console.log('Categorie selezionate:', selectedCategories);
        if (selectedCategories.length > 0) {
          this.ristoranteService.getRistorantiByCategorie(selectedCategories);
        } else {
          this.ristoranteService.loadRistoranti();
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngAfterViewInit(): void {
    this.updateScrollButtons();
    this.scrollableDiv.nativeElement.addEventListener('scroll', () => {
      this.updateScrollButtons();
    });
    window.addEventListener('resize', this.updateScrollButtons.bind(this));
  }
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateScrollButtons.bind(this));
  }

  scrollLeft(): void {
    const el = this.scrollableDiv.nativeElement;
    el.scrollLeft -= 300;
    this.updateScrollButtons();
  }

  scrollRight(): void {
    const el = this.scrollableDiv.nativeElement;
    el.scrollLeft += 300;
    this.updateScrollButtons();
  }
  updateScrollButtons(): void {
    const el = this.scrollableDiv.nativeElement;
    this.canScrollLeft.set(el.scrollLeft > 0);
    this.canScrollRight.set(el.scrollWidth > el.clientWidth + el.scrollLeft);
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
    localStorage.setItem('userLat', this.userLat.toString());
    localStorage.setItem('userLon', this.userLon.toString());
    this.suggestions = [];
    this.ristoranteService.setCityName(suggestion.display_name);
    this.searchAddress();
  }

  searchAddress(): void {
    if (this.userLat !== null && this.userLon !== null) {
      const maxDistanceKm = 50;
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

  getImageUrl(immaginePath: string | null): string {
    return this.ristoranteService.getImageUrl(immaginePath);
  }
  calculateDistance(
    latitudineRistorante: number,
    longitudineRistorante: number
  ): string {
    if (
      this.userLat === null ||
      this.userLon === null ||
      !latitudineRistorante ||
      !longitudineRistorante
    ) {
      console.error(
        'Distanza non calcolata, latitudine o longitudine mancanti'
      );
      return 'N/A';
    }

    //formula di Haversine
    const toRad = (value: number) => (value * Math.PI) / 180;
    const latDistance = toRad(latitudineRistorante - this.userLat);
    const lonDistance = toRad(longitudineRistorante - this.userLon);

    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(toRad(this.userLat)) *
        Math.cos(toRad(latitudineRistorante)) *
        Math.sin(lonDistance / 2) *
        Math.sin(lonDistance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const R = 6371;
    const distanceKm = R * c;

    if (distanceKm < 1) {
      const distanceMeters = distanceKm * 1000;
      return `${distanceMeters.toFixed(0)} m`;
    } else {
      return `${distanceKm.toFixed(1)} km`;
    }
  }
}
