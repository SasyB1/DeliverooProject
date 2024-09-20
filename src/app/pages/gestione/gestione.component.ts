import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { iOrdine } from '../../Models/Ordine';
import { CartService } from '../../Services/cart.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestione',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestione.component.html',
  styleUrl: './gestione.component.scss',
})
export class GestioneComponent implements OnInit {
  idRistorante!: number;
  ordini: iOrdine[] = [];
  idUtente: number | null = null;
  filtratiOrdini: iOrdine[] = [];
  statoFiltro: string = 'Tutti';

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idRistorante = +params['id'];
      this.getOrdini();
    });
  }

  getOrdini(): void {
    this.route.params.subscribe((params) => {
      this.idRistorante = +params['id'];
      this.cartService.getOrdiniByRistorante(this.idRistorante).subscribe(
        (ordini) => {
          this.ordini = ordini;
          this.filtratiOrdini = ordini;
        },
        (error) => {
          console.error('Errore nel recupero degli ordini:', error);
        }
      );
    });
  }

  calcolaPrezzoTotale(dettagliOrdine: any[]): number {
    return dettagliOrdine.reduce((somma, dettaglio) => {
      return somma + dettaglio.piatto.prezzo * dettaglio.quantita;
    }, 0);
  }
  filtraOrdini(stato: string): void {
    this.statoFiltro = stato;

    if (stato === 'Tutti') {
      this.filtratiOrdini = this.ordini;
    } else {
      this.filtratiOrdini = this.ordini.filter(
        (ordine) => ordine.stato === stato
      );
    }
  }
  cambiaStato(idOrdine: number): void {
    this.cartService.cambiaStatoOrdine(idOrdine, 'Consegnato').subscribe(
      () => {
        const ordine = this.filtratiOrdini.find(
          (o) => o.iD_Ordine === idOrdine
        );
        if (ordine) {
          ordine.stato = 'Consegnato';
        }

        Swal.fire({
          title: 'Successo!',
          text: "Stato dell'ordine aggiornato con successo.",
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.filtraOrdini(this.statoFiltro);
      },
      (error) => {
        console.error("Errore nel cambio dello stato dell'ordine:", error);
        Swal.fire({
          title: 'Errore!',
          text: "Errore nel cambio dello stato dell'ordine.",
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
}
