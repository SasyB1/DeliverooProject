import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iRistorante } from '../Models/Ristorante';
import { iSuggestion } from '../Models/OSMSuggestion';

@Injectable({
  providedIn: 'root',
})
export class RistoranteService {
  private apiUrlRistoranti = 'https://localhost:7223/vicini';
  private apiUrlSuggestions = 'https://nominatim.openstreetmap.org/search';

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

    return this.http.get<iRistorante[]>(this.apiUrlRistoranti, { params });
  }

  getSuggestions(query: string): Observable<iSuggestion[]> {
    const params = new HttpParams()
      .set('format', 'json')
      .set('q', query)
      .set('addressdetails', '1')
      .set('limit', '5');

    return this.http.get<iSuggestion[]>(this.apiUrlSuggestions, { params });
  }
}
