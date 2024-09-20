import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../Services/cart.service';
import { iCartItem } from '../../Models/CartItem';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  cartItems: iCartItem[] = [];
  totalCartPrice: number = 0;

  via: string = '';
  numeroCivico: string = '';
  piano: string = '';
  cap: string = '';
  citofono: string = '';
  citta: string = '';

  cityNameFromLocalStorage: string = '';
  userNameFromLocalStorage: string = '';

  idUtente: number | null = null;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems()();
    this.totalCartPrice = this.cartService.totalCartPrice();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.iD_Utente) {
      this.idUtente = user.iD_Utente;
      this.userNameFromLocalStorage = `${user.nome} ${user.cognome}`;
      this.cityNameFromLocalStorage = localStorage.getItem('cityName') || '';
      this.citta = this.cityNameFromLocalStorage;
    } else {
      console.error('ID Utente non trovato nel localStorage');
    }
  }

  submitOrder(event: Event) {
    event.preventDefault();
    if (!this.idUtente) {
      console.error('Errore: ID utente non trovato');
      return;
    }
    if (
      !this.via ||
      !this.numeroCivico ||
      !this.cap ||
      !this.citta ||
      !this.idUtente
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Errore',
        text: 'Tutti i campi obbligatori devono essere compilati',
      });
      return;
    }
    if (this.cartItems.length === 0) {
      console.error('Errore: Il carrello è vuoto');
      return;
    }

    const idRistorante = localStorage.getItem('idRistorante');

    if (!idRistorante) {
      console.error('Errore: ID del ristorante non trovato');
      return;
    }

    this.cartService.creaOrdine(this.idUtente, +idRistorante).subscribe({
      next: (response: any) => {
        const idOrdine = response.idOrdine;

        this.cartItems.forEach((item) => {
          this.cartService
            .aggiungiPiattoAOrdine(
              idOrdine,
              item.piatto.iD_Piatto,
              item.quantita
            )
            .subscribe({
              next: () => {
                if (item.ingredienti && item.ingredienti.length > 0) {
                  item.ingredienti.forEach((ingrediente) => {
                    this.cartService
                      .aggiungiIngredienteADettaglioOrdine(
                        idOrdine,
                        ingrediente.iD_Ingrediente,
                        1
                      )
                      .subscribe();
                  });
                }
              },
              error: (err) => {
                console.error("Errore durante l'aggiunta del piatto:", err);
              },
            });
        });
        this.cartService.clearCart();
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        console.error("Errore durante la creazione dell'ordine:", err);
      },
    });
  }
  onExpiryDateInput(event: any): void {
    let input = event.target.value.replace(/\D/g, '');

    if (input.length >= 2) {
      let month = input.substring(0, 2);
      if (+month < 1) {
        month = '01';
      } else if (+month > 12) {
        month = '12';
      }
      input = month + (input.length > 2 ? '/' + input.substring(2, 4) : '');
    }

    if (input.length === 5) {
      const year = input.substring(3, 5);
      if (+year < 25) {
        input = input.substring(0, 3);
      }
    }

    event.target.value = input;
  }

  onCapInput(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 5) {
      input = input.substring(0, 5);
    }
    event.target.value = input;
    this.cap = input;
  }
  onNumeroCivicoInput(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    event.target.value = input;
    this.numeroCivico = input;
  }
  onCardNumberInput(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 16) {
      input = input.substring(0, 16);
    }
    let formattedInput = input.match(/.{1,4}/g)?.join(' ') || input;
    event.target.value = formattedInput;
  }
}
