import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService } from '../../Services/cart.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { iRecensione } from '../../Models/Recensione';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-recensione',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './recensione.component.html',
  styleUrl: './recensione.component.scss',
})
export class RecensioneComponent implements OnInit {
  idOrdine: number | null = null;
  idRistorante: number | null = null;
  idUtente: number | null = null;
  valutazione: number = 0;
  commento: string = '';
  hoverRatingValue: number = 0;
  recensioni: iRecensione[] = [];

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.idUtente = user?.iD_Utente || null;
    this.idOrdine = Number(localStorage.getItem('idOrdine')) || null;
    this.idRistorante = Number(localStorage.getItem('idRistorante')) || null;

    if (!this.idOrdine || !this.idRistorante || !this.idUtente) {
      Swal.fire({
        icon: 'error',
        title: 'Errore',
        text: 'Impossibile recuperare i dati per la recensione.',
      });
      this.router.navigate(['/']);
    }

    if (this.idRistorante) {
      this.getRecensioniRistorante(this.idRistorante);
    }
  }

  getRecensioniRistorante(idRistorante: number) {
    this.cartService.getRecensioniByRistorante(idRistorante).subscribe(
      (recensioni) => {
        this.recensioni = recensioni;
      },
      (error) => {
        console.error('Errore nel recupero delle recensioni:', error);
      }
    );
  }

  selectRating(star: number) {
    this.valutazione = star;
  }

  hoverRating(star: number) {
    this.hoverRatingValue = star;
  }

  submitRecensione() {
    if (!this.valutazione || this.valutazione < 1 || this.valutazione > 5) {
      Swal.fire({
        icon: 'error',
        title: 'Errore',
        text: 'Seleziona una valutazione valida tra 1 e 5 stelle.',
      });
      return;
    }

    if (this.idOrdine && this.idRistorante && this.idUtente) {
      this.cartService
        .aggiungiRecensione(
          this.idOrdine,
          this.idRistorante,
          this.idUtente,
          this.valutazione,
          this.commento
        )
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Recensione aggiunta',
              text: 'Grazie per la tua recensione!',
            });
            localStorage.removeItem('idOrdine');
            localStorage.removeItem('idRistorante');
            this.router.navigate(['/']);
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Errore',
              text: "Si è verificato un errore durante l'invio della recensione.",
            });
            console.error("Errore durante l'invio della recensione:", err);
          },
        });
    }
  }
}
