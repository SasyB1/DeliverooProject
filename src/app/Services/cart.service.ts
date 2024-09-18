import { Injectable, signal } from '@angular/core';
import { iIngrediente } from '../Models/Ingrediente';
import { iPiatto } from '../Models/Piatto';

interface CartItem {
  piatto: iPiatto;
  quantita: number;
  ingredienti?: iIngrediente[];
  prezzoTotale: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  totalCartPrice = signal<number>(0);

  constructor() {
    this.loadCartFromLocalStorage();
  }

  getCartItems() {
    return this.cartItems;
  }

  addPiattoToCart(
    piatto: iPiatto,
    quantita: number,
    ingredienti: iIngrediente[]
  ) {
    const existingItemIndex = this.cartItems().findIndex(
      (item) =>
        item.piatto.iD_Piatto === piatto.iD_Piatto &&
        this.areIngredientsEqual(item.ingredienti || [], ingredienti)
    );

    if (existingItemIndex > -1) {
      this.cartItems.update((cart) => {
        const existingItem = cart[existingItemIndex];
        existingItem.quantita += quantita;
        existingItem.prezzoTotale =
          (existingItem.piatto.prezzo +
            this.calculateIngredientiPrice(ingredienti)) *
          existingItem.quantita;
        return cart;
      });
    } else {
      const prezzoTotale =
        (piatto.prezzo + this.calculateIngredientiPrice(ingredienti)) *
        quantita;
      const newCartItem: CartItem = {
        piatto,
        quantita,
        ingredienti,
        prezzoTotale,
      };

      this.cartItems.update((cart) => [...cart, newCartItem]);
    }

    this.calculateTotalPrice();
    this.saveCartToLocalStorage();
  }

  private areIngredientsEqual(
    ingredienti1: iIngrediente[],
    ingredienti2: iIngrediente[]
  ): boolean {
    if (ingredienti1.length !== ingredienti2.length) {
      return false;
    }

    return ingredienti1.every((ingrediente) =>
      ingredienti2.some(
        (ingr) => ingr.iD_Ingrediente === ingrediente.iD_Ingrediente
      )
    );
  }

  private calculateIngredientiPrice(ingredienti: iIngrediente[]): number {
    return ingredienti.reduce(
      (sum: number, ingrediente: iIngrediente) => sum + ingrediente.prezzo,
      0
    );
  }

  private calculateTotalPrice() {
    const total = this.cartItems().reduce(
      (sum, item) => sum + item.prezzoTotale,
      0
    );
    this.totalCartPrice.set(total);
  }

  clearCart() {
    this.cartItems.set([]);
    this.totalCartPrice.set(0);
  }
  private saveCartToLocalStorage() {
    const cartItems = this.cartItems();
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }

  private loadCartFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      const parsedCartItems: CartItem[] = JSON.parse(cartData);
      this.cartItems.set(parsedCartItems);
      this.calculateTotalPrice();
    }
  }
}
