import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CartService } from '../../Services/cart.service';
import { iOrdine } from '../../Models/Ordine';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-storico',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './storico.component.html',
  styleUrl: './storico.component.scss',
})
export class StoricoComponent implements OnInit {
  ordini: iOrdine[] = [];
  idUtente!: number;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.idUtente = user.iD_Utente;
      this.getStoricoOrdini();
    } else {
      console.error('Utente non trovato nel localStorage.');
    }
  }

  getStoricoOrdini(): void {
    this.cartService.getOrdiniByUtente(this.idUtente).subscribe(
      (ordini) => {
        this.ordini = ordini;
      },
      (error) => {
        console.error('Errore nel recuperare lo storico ordini', error);
      }
    );
  }
  calcolaPrezzoTotale(dettagliOrdine: any[]): number {
    let totale = 0;
    dettagliOrdine.forEach((dettaglio) => {
      totale += dettaglio.prezzo * dettaglio.quantita;
      if (dettaglio.ingredienti && dettaglio.ingredienti.length > 0) {
        dettaglio.ingredienti.forEach((ingrediente: any) => {
          totale += ingrediente.prezzo * dettaglio.quantita;
        });
      }
    });
    return totale;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
