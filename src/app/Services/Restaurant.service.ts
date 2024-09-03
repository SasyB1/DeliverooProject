import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
}
