import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { iRistorante } from '../Models/Ristorante';
import { iSuggestion } from '../Models/OSMSuggestion';

@Injectable({
  providedIn: 'root',
})
export class RistoranteService {
  private apiUrlRistoranti = 'https://localhost:7223/vicini';
  private apiUrlSuggestions = 'https://nominatim.openstreetmap.org/search';

  ristoranti = signal<iRistorante[]>([]);
  cityName = signal<string>('');

  constructor(private http: HttpClient) {}

  getRistoranti(
    latitudine: number,
    longitudine: number,
    distanzaMassimaKm: number
  ): Observable<iRistorante[]> {
    const params = new HttpParams()
      .set('latitudine', latitudine.toString())
      .set('longitudine', longitudine.toString())
      .set('distanzaMassimaKm', distanzaMassimaKm.toString());

    return this.http
      .get<iRistorante[]>(this.apiUrlRistoranti, { params })
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

  setRistoranti(newRistoranti: iRistorante[]): void {
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
