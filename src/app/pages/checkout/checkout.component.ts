import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../Services/cart.service';
import { iCartItem } from '../../Models/CartItem';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  cartItems: iCartItem[] = [];
  totalCartPrice: number = 0;
  idUtente: number | null = null;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems()();
    this.totalCartPrice = this.cartService.totalCartPrice();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.iD_Utente) {
      this.idUtente = user.iD_Utente;
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
}
