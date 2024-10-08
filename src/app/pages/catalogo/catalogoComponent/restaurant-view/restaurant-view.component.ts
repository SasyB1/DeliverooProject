import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { iRestaurantDetails } from '../../../../Models/RestaurantDetails';
import { RestaurantService } from '../../../../Services/Restaurant.service';
import { FormsModule } from '@angular/forms';
import { iMenu } from '../../../../Models/Menu';
import { iPiatto } from '../../../../Models/Piatto';
import { iIngrediente } from '../../../../Models/Ingrediente';
import { CartService } from '../../../../Services/cart.service';
import { iCartItem } from '../../../../Models/CartItem';
import { iRecensione } from '../../../../Models/Recensione';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './restaurant-view.component.html',
  styleUrl: './restaurant-view.component.scss',
})
export class RestaurantViewComponent implements OnInit {
  restaurantDetails: iRestaurantDetails | null = null;
  recensioni: iRecensione[] = [];
  firstMenus: iMenu[] = [];
  extraMenus: iMenu[] = [];
  maxMenusInRow = 2;
  activeMenuId: number | null = null;
  averageRating: number | null = null;
  numberOfReviews: number = 0;

  userLat: number | null = null;
  userLon: number | null = null;
  quantity: number = 1;
  ingredienti: iIngrediente[] = [];
  selectedIngredients: iIngrediente[] = [];
  totalPrice: number = 0;

  cartVisible: boolean = false;

  constructor(
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
    public cartService: CartService,
    private router: Router
  ) {
    const savedLat = localStorage.getItem('userLat');
    const savedLon = localStorage.getItem('userLon');
    if (savedLat && savedLon) {
      this.userLat = parseFloat(savedLat);
      this.userLon = parseFloat(savedLon);
    }
  }

  ngOnInit(): void {
    const restaurantId = this.route.snapshot.params['id'];

    this.restaurantService.getRestaurantDetails(restaurantId).subscribe({
      next: (details) => {
        this.restaurantDetails = details;

        if (this.restaurantDetails.menus.length > this.maxMenusInRow) {
          this.firstMenus = this.restaurantDetails.menus.slice(
            0,
            this.maxMenusInRow
          );
          this.extraMenus = this.restaurantDetails.menus.slice(
            this.maxMenusInRow
          );
        } else {
          this.firstMenus = this.restaurantDetails.menus;
          this.extraMenus = [];
        }
        this.getIngredienti();
        this.loadReviews(restaurantId);
      },
      error: (err) => {
        console.error(
          'Errore nel caricamento dei dettagli del ristorante:',
          err
        );
      },
    });
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
      return 'N/A';
    }

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

  getOrarioChiusuraOggi(): string {
    if (
      !this.restaurantDetails ||
      !this.restaurantDetails.ristorante.orariApertura
    ) {
      console.log(
        'Nessun orario di apertura disponibile o dati del ristorante mancanti.'
      );
      return 'Orario non disponibile';
    }

    const orariApertura = this.restaurantDetails.ristorante.orariApertura;

    const oggi = new Date().getDay();
    const orarioOggi = orariApertura.find(
      (orario) => orario.giornoSettimana === oggi
    );

    if (orarioOggi) {
      return `Chiude alle ${orarioOggi.oraChiusura.slice(0, 5)}`;
    } else {
      console.log('Nessun orario di chiusura trovato per oggi');
      return 'Orario non disponibile';
    }
  }

  getImageUrl(immaginePath: string | null): string {
    return this.restaurantService.getImageUrl(immaginePath);
  }

  getCategorieAsString(): string {
    if (!this.restaurantDetails || !this.restaurantDetails.categorie) {
      return '';
    }
    return this.restaurantDetails.categorie.map((cat) => cat.nome).join(' · ');
  }

  goBack() {
    this.router.navigate(['/catalogo']);
  }

  scrollToMenu(menuId: number): void {
    const element = document.getElementById('menu-' + menuId);
    const offset = -85;
    this.activeMenuId = menuId;
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition + offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }

  getIngredienti() {
    this.restaurantService.getAllIngredienti().subscribe({
      next: (data: iIngrediente[]) => {
        this.ingredienti = data;
      },
      error: (error) => {
        console.error('Errore nel recuperare gli ingredienti:', error);
      },
    });
  }

  isIngredientSelected(ingrediente: iIngrediente): boolean {
    return this.selectedIngredients.some(
      (i) => i.iD_Ingrediente === ingrediente.iD_Ingrediente
    );
  }

  aggiungiAlCarrello(piatto: iPiatto) {
    const ristoranteNome = this.restaurantDetails?.ristorante.nome;
    const ristoranteId = this.restaurantDetails?.ristorante.iD_Ristorante;

    if (!ristoranteId || !ristoranteNome) {
      console.error('ID o nome del ristorante non trovati.');
      return;
    }

    if (piatto.consenteIngredienti) {
      this.cartService.addPiattoToCart(
        piatto,
        this.quantity,
        this.selectedIngredients,
        ristoranteId,
        ristoranteNome
      );
    } else {
      this.cartService.addPiattoToCart(
        piatto,
        this.quantity,
        [],
        ristoranteId,
        ristoranteNome
      );
    }

    this.selectedIngredients = [];
    this.quantity = 1;
    this.totalPrice = 0;
  }

  onIngredientChange(event: any, ingrediente: iIngrediente, piatto: iPiatto) {
    if (event.target.checked) {
      this.selectedIngredients.push(ingrediente);
    } else {
      this.selectedIngredients = this.selectedIngredients.filter(
        (i) => i.iD_Ingrediente !== ingrediente.iD_Ingrediente
      );
    }

    this.calculateTotalPrice(piatto);
  }

  calculateTotalPrice(piatto: iPiatto) {
    const ingredientPrice = this.selectedIngredients.reduce(
      (sum, ingrediente) => sum + ingrediente.prezzo,
      0
    );
    const basePrice = piatto.prezzo;
    this.totalPrice = (basePrice + ingredientPrice) * this.quantity;
  }

  onQuantityChange(piatto: iPiatto) {
    this.calculateTotalPrice(piatto);
  }

  apriModale(piatto: iPiatto) {
    this.totalPrice = piatto.prezzo * this.quantity;
    this.selectedIngredients = [];
  }

  removeItemFromCart(item: iCartItem) {
    this.cartService.removePiattoFromCart(
      item.piatto.iD_Piatto,
      item.ingredienti
    );
  }

  toggleCart() {
    this.cartVisible = !this.cartVisible;
  }

  loadReviews(restaurantId: number): void {
    this.cartService.getRecensioniByRistorante(restaurantId).subscribe({
      next: (recensioni) => {
        this.recensioni = recensioni;
        this.numberOfReviews = recensioni.length;
        if (this.numberOfReviews > 0) {
          const totalValutazione = recensioni.reduce(
            (sum, recensione) => sum + recensione.valutazione,
            0
          );
          this.averageRating = totalValutazione / this.numberOfReviews;
        } else {
          this.averageRating = null;
        }
      },
      error: (err) => {
        console.error('Errore nel caricamento delle recensioni:', err);
      },
    });
  }
}
