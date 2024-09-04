import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { iSuggestion } from '../Models/OSMSuggestion';
import { iRestaurant } from '../Models/Restaurant';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrlRistoranti = 'https://localhost:7223/vicini';
  private apiUrlSuggestions = 'https://nominatim.openstreetmap.org/search';
  private apiUrlCreaRistorante = 'https://localhost:7223/crea-ristorante';

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

  createRestaurant(restaurant: iRestaurant, file?: File): Observable<any> {
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
      .post(this.apiUrlCreaRistorante, formData, {
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        tap((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log(
              'Upload Progress: ',
              Math.round((event.loaded / event.total!) * 100)
            );
          } else if (event.type === HttpEventType.Response) {
            console.log('Upload Complete', event.body);
          }
        })
      );
  }
}
