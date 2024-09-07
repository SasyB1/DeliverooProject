import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { iMenu } from '../Models/Menu';
import { iPiatto } from '../Models/Piatto';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private apiUrl = 'https://localhost:7223';

  constructor(private http: HttpClient) {}

  getMenusByRestaurant(idRistorante: number): Observable<iMenu[]> {
    return this.http.get<iMenu[]>(`${this.apiUrl}/get-menus/${idRistorante}`);
  }

  createMenu(nome: string, idRistorante: number): Observable<iMenu> {
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('idRistorante', idRistorante.toString());
    return this.http.post<iMenu>(`${this.apiUrl}/create-menu`, formData);
  }

  getPiattiByMenu(idMenu: number): Observable<iPiatto[]> {
    return this.http.get<iPiatto[]>(`${this.apiUrl}/get-piatti/${idMenu}`);
  }

  createPiatto(
    name: string,
    description: string,
    price: number,
    menuId: number
  ): Observable<any> {
    const formData = new FormData();
    formData.append('nome', name);
    formData.append('descrizione', description);
    formData.append('prezzo', price.toString());
    formData.append('idMenu', menuId.toString());

    console.log('Dati inviati al server:', formData);

    return this.http.post<any>(`${this.apiUrl}/create-piatto`, formData);
  }
}
