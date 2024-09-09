import { Injectable, signal } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { filter, map, Observable, tap } from 'rxjs';

import { iSuggestion } from '../Models/OSMSuggestion';
import { iRestaurant } from '../Models/Restaurant';
import { iCategoria } from '../Models/Category';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrlRistoranti = 'https://localhost:7223/vicini';
  private apiUrlSuggestions = 'https://nominatim.openstreetmap.org/search';
  private apiUrlCreaRistorante = 'https://localhost:7223/crea-ristorante';
  private apiUrlRistorantiUser = 'https://localhost:7223/GetRestaurantsByUser';
  private apiUrlCategorie = 'https://localhost:7223/categorie';
  private apiUrlAggiungiCategorie = 'https://localhost:7223/aggiungi-categorie';

  // Utilizzo dei segnali
  ristoranti = signal<iRestaurant[]>([]);
  cityName = signal<string>('');

  constructor(private http: HttpClient) {}

  getRistoranti(
    latitudine: number,
    longitudine: number,
    distanzaMassimaKm: number
  ): Observable<iRestaurant[]> {
    const params = new HttpParams()
      .set('latitudine', latitudine.toString())
      .set('longitudine', longitudine.toString())
      .set('distanzaMassimaKm', distanzaMassimaKm.toString());

    return this.http
      .get<iRestaurant[]>(this.apiUrlRistoranti, { params })
      .pipe(tap((newRistoranti) => this.setRistoranti(newRistoranti)));
  }

  getSuggestions(query: string): Observable<iSuggestion[]> {
    const params = new HttpParams()
      .set('format', 'json')
      .set('q', query)
      .set('addressdetails', '1')
      .set('limit', '5');

    return this.http.get<iSuggestion[]>(this.apiUrlSuggestions, { params });
  }

  setRistoranti(newRistoranti: iRestaurant[]): void {
    this.ristoranti.set(newRistoranti);
    localStorage.setItem('ristoranti', JSON.stringify(newRistoranti));
  }

  loadRistoranti(): void {
    const savedRistoranti = localStorage.getItem('ristoranti');
    if (savedRistoranti) {
      this.ristoranti.set(JSON.parse(savedRistoranti));
    }
  }

  setCityName(newCityName: string): void {
    this.cityName.set(newCityName);
  }

  getCityName(): string {
    return this.cityName();
  }

  createRestaurant(
    restaurant: iRestaurant,
    file?: File
  ): Observable<iRestaurant> {
    const formData: FormData = new FormData();
    formData.append('nome', restaurant.nome);
    formData.append('indirizzo', restaurant.indirizzo);
    formData.append('telefono', restaurant.telefono);
    formData.append('email', restaurant.email);
    formData.append('ID_Utente', restaurant.ID_Utente.toString());
    formData.append('latitudine', restaurant.latitudine.toString());
    formData.append('longitudine', restaurant.longitudine.toString());
    formData.append('orariApertura', JSON.stringify(restaurant.orariApertura));

    if (file) {
      formData.append('immagine', file, file.name);
    }

    return this.http
      .post<iRestaurant>(this.apiUrlCreaRistorante, formData, {
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        tap((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log(
              'Upload Progress: ',
              Math.round((event.loaded / event.total!) * 100)
            );
          }
        }),
        filter(
          (event): event is HttpResponse<iRestaurant> =>
            event.type === HttpEventType.Response
        ),
        map(
          (response: HttpResponse<iRestaurant>) => response.body as iRestaurant
        )
      );
  }

  getRestaurantsByUser(iD_Utente: number): Observable<any> {
    return this.http.get(`${this.apiUrlRistorantiUser}/${iD_Utente}`);
  }

  getCategories(): Observable<iCategoria[]> {
    return this.http.get<iCategoria[]>(this.apiUrlCategorie);
  }

  addCategoriesToRestaurant(
    restaurantId: number,
    selectedCategories: number[]
  ): Observable<any> {
    const formData = new FormData();
    formData.append('idRistorante', restaurantId.toString());
    selectedCategories.forEach((categoryId) => {
      formData.append('categoryIds', categoryId.toString());
    });

    return this.http.post(this.apiUrlAggiungiCategorie, formData);
  }
  getCategorieAssociate(restaurantId: number): Observable<number[]> {
    return this.http.get<number[]>(
      `https://localhost:7223/get-categorie-associate/${restaurantId}`
    );
  }
  getImageUrl(immaginePath: string | null): string {
    if (!immaginePath) {
      return '';
    }
    return `https://localhost:7223${immaginePath}`;
  }
}
