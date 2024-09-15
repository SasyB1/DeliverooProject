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
  selectedCategories = this.ristoranteService.selectedCategories;

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
    effect(
      () => {
        this.cityName = this.ristoranteService.getCityName();
        console.log('City name aggiornato:', this.cityName);
      },
      { allowSignalWrites: true }
    );
    this.ristoranteService.loadRistoranti();
    effect(
      () => {
        const ristorantiFiltrati = this.ristoranti();
        console.log('Ristoranti filtrati ricevuti:', ristorantiFiltrati);
        ristorantiFiltrati.forEach((r) => console.log(r.immaginePath));
      },
      { allowSignalWrites: true }
    );
    effect(
      () => {
        const selectedCategories = this.selectedCategories();
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
  onCategoryChange(event: any): void {
    const categoryId = Number(event.target.value);
    if (event.target.checked) {
      this.selectedCategories.update((categories) => [
        ...categories,
        categoryId,
      ]);
    } else {
      this.selectedCategories.update((categories) =>
        categories.filter((id) => id !== categoryId)
      );
    }
    this.ristoranteService.updateSelectedCategories(this.selectedCategories());
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories().includes(categoryId);
  }

  clearFilters(): void {
    this.selectedCategories.set([]);
    this.ristoranteService.updateSelectedCategories([]);
  }

  removeCategory(categoryId: number): void {
    this.selectedCategories.update((categories) =>
      categories.filter((id) => id !== categoryId)
    );
    this.ristoranteService.updateSelectedCategories(this.selectedCategories());
  }

  getCategoryName(categoryId: number): string {
    const categoryMap: { [key: number]: string } = {
      1: 'Halal',
      2: 'Senza Glutine',
      3: 'Vegan Friendly',
      4: 'Vegetariano',
      5: 'Americano',
      6: 'Asiatico fusion',
      7: 'Cinese',
      8: 'Colazione',
      9: 'Giapponese',
      10: 'Greco',
      11: 'Hawaiano',
      12: 'Healthy',
      13: 'Indiano',
      14: 'Italiano',
      15: 'Messicano',
      16: 'Peruviano',
      17: 'Spagnolo',
      18: 'Spesa',
      19: 'Thailandese',
      20: 'Turco',
      21: 'Bakery',
      22: 'Bubble tea',
      23: 'Burrito',
      24: 'Carne',
      25: 'Dessert',
      26: 'Frutti di mare',
      27: 'Hamburger',
      28: 'Hot dogs',
      29: 'Insalate',
      30: 'Kebab',
      31: 'Noodles',
      32: 'Pasta',
      33: 'Piadina',
      34: 'Pizza',
      35: 'Poke',
      36: 'Pollo',
      37: 'Ramen',
      38: 'Sandwich',
      39: 'Sushi',
      40: 'Tacos',
    };
    return categoryMap[categoryId] || 'Categoria sconosciuta';
  }

  getCheckboxId(categoryId: number): string {
    const checkboxMap: { [key: number]: string } = {
      1: 'halal',
      2: 'senzaGlutine',
      3: 'veganFriendly',
      4: 'vegetariano',
      5: 'americano',
      6: 'asiaticoFusion',
      7: 'cinese',
      8: 'colazione',
      9: 'giapponese',
      10: 'greco',
      11: 'hawaiano',
      12: 'healthy',
      13: 'indiano',
      14: 'italiano',
      15: 'messicano',
      16: 'peruviano',
      17: 'spagnolo',
      18: 'spesa',
      19: 'thailandese',
      20: 'turco',
      21: 'bakery',
      22: 'bubbleTea',
      23: 'burrito',
      24: 'carne',
      25: 'dessert',
      26: 'fruttiDiMare',
      27: 'hamburger',
      28: 'hotDogs',
      29: 'insalate',
      30: 'kebab',
      31: 'noodles',
      32: 'pasta',
      33: 'piadina',
      34: 'pizza',
      35: 'poke',
      36: 'pollo',
      37: 'ramen',
      38: 'sandwich',
      39: 'sushi',
      40: 'tacos',
    };
    return checkboxMap[categoryId];
  }
}
