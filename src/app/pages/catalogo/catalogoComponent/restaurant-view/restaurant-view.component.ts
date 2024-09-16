import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { iRestaurantDetails } from '../../../../Models/RestaurantDetails';
import { RestaurantService } from '../../../../Services/Restaurant.service';
import { iCategoria } from '../../../../Models/Category';

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-view.component.html',
  styleUrl: './restaurant-view.component.scss',
})
export class RestaurantViewComponent implements OnInit {
  restaurantDetails: iRestaurantDetails | null = null;
  firstCategories: iCategoria[] = [];
  extraCategories: iCategoria[] = [];
  maxCategoriesInRow = 6;

  userLat: number | null = null;
  userLon: number | null = null;

  constructor(
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
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
        console.log('Dettagli del ristorante:', details);
        this.restaurantDetails = details;

        if (this.restaurantDetails.categorie.length > this.maxCategoriesInRow) {
          this.firstCategories = this.restaurantDetails.categorie.slice(
            0,
            this.maxCategoriesInRow
          );
          this.extraCategories = this.restaurantDetails.categorie.slice(
            this.maxCategoriesInRow
          );
        } else {
          this.firstCategories = this.restaurantDetails.categorie;
          this.extraCategories = [];
        }
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

    // Formula di Haversine
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

    console.log('Oggi è:', oggi);
    console.log('Orari di apertura:', orariApertura);

    const orarioOggi = orariApertura.find(
      (orario) => orario.giornoSettimana === oggi
    );

    if (orarioOggi) {
      console.log('Orario di chiusura di oggi:', orarioOggi.oraChiusura);
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
}
