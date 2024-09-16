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
import { iRestaurantDetails } from '../Models/RestaurantDetails';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrlRistoranti = 'https://localhost:7223/vicini';
  private apiUrlSuggestions = 'https://nominatim.openstreetmap.org/search';
  private apiUrlCreaRistorante = 'https://localhost:7223/crea-ristorante';
  private apiUrlRistorantiUser = 'https://localhost:7223/GetRestaurantsByUser';
  private apiUrlCategorie = 'https://localhost:7223/categorie';
  private apiUrlAggiungiCategorie = 'https://localhost:7223/aggiorna-categorie';
  private apiUrlRistorantiUpdate = 'https://localhost:7223/update-ristorante';
  private apiUrlRistorantiDelete = 'https://localhost:7223/delete-ristorante';
  private apiUrlRistorantiCategoria =
    'https://localhost:7223/ristoranti-per-categoria';
  private apiUrlRestaurantDetails =
    'https://localhost:7223/get-ristorante-dettagli';

  // Utilizzo dei segnali
  ristoranti = signal<iRestaurant[]>([]);
  cityName = signal<string>('');
  selectedCategories = signal<number[]>([]);

  constructor(private http: HttpClient) {
    const savedCategories = localStorage.getItem('selectedCategories');
    if (savedCategories) {
      const categorie = JSON.parse(savedCategories);
      this.selectedCategories.set(categorie);
      this.getRistorantiByCategorie(categorie);
    }
    const savedCityName = localStorage.getItem('cityName');
    if (savedCityName) {
      this.cityName.set(savedCityName);
    }
  }

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
    localStorage.setItem('cityName', newCityName);
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

  aggiornaCategorieRistorante(
    restaurantId: number,
    selectedCategories: number[]
  ): Observable<any> {
    const formData = new FormData();
    formData.append('idRistorante', restaurantId.toString());
    formData.append('categoryIds', JSON.stringify(selectedCategories));

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
  updateRestaurant(
    restaurant: iRestaurant,
    file?: File
  ): Observable<iRestaurant> {
    if (!restaurant.iD_Ristorante) {
      throw new Error('ID del ristorante non definito');
    }

    const formData: FormData = new FormData();
    formData.append('idRistorante', restaurant.iD_Ristorante.toString());
    formData.append('nome', restaurant.nome);
    formData.append('indirizzo', restaurant.indirizzo);
    formData.append('telefono', restaurant.telefono);
    formData.append('email', restaurant.email);
    formData.append('latitudine', restaurant.latitudine.toString());
    formData.append('longitudine', restaurant.longitudine.toString());

    const updatedOpeningHours = restaurant.orariApertura.map((orario) => ({
      ID_OrarioApertura: orario.iD_OrarioApertura,
      GiornoSettimana: orario.giornoSettimana,
      OraApertura: orario.oraApertura,
      OraChiusura: orario.oraChiusura,
    }));
    formData.append('orariApertura', JSON.stringify(updatedOpeningHours));

    if (file) {
      formData.append('immagine', file, file.name);
    }

    return this.http
      .put<iRestaurant>(`${this.apiUrlRistorantiUpdate}`, formData, {
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
  deleteRestaurant(idRistorante: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrlRistorantiDelete}/${idRistorante}`
    );
  }
  updateSelectedCategories(categorie: number[]): void {
    this.selectedCategories.set(categorie);
    localStorage.setItem('selectedCategories', JSON.stringify(categorie));
    this.getRistorantiByCategorie(categorie);
  }

  loadSelectedCategories(): number[] {
    const savedCategories = localStorage.getItem('selectedCategories');
    return savedCategories ? JSON.parse(savedCategories) : [];
  }

  getRistorantiByCategorie(categorie: number[]): void {
    if (categorie.length === 0) {
      this.loadRistoranti();
      return;
    }

    let params = new HttpParams();
    categorie.forEach((categoria) => {
      params = params.append('idCategoria', categoria.toString());
    });

    this.http
      .get<iRestaurant[]>(this.apiUrlRistorantiCategoria, { params })
      .subscribe({
        next: (ristoranti) => {
          if (ristoranti.length > 0) {
            this.ristoranti.set(ristoranti);
          } else {
            this.ristoranti.set([]);
          }
        },
        error: (err) => {
          if (err.status === 404) {
            this.ristoranti.set([]);
          } else {
            console.error('Errore nel recupero dei ristoranti:', err);
          }
        },
      });
  }
  getRestaurantDetails(restaurantId: number): Observable<iRestaurantDetails> {
    return this.http.get<iRestaurantDetails>(
      `${this.apiUrlRestaurantDetails}/${restaurantId}`
    );
  }
}
