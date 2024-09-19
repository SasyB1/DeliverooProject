import { iIngrediente } from './Ingrediente';
import { iPiatto } from './Piatto';

export interface iCartItem {
  piatto: iPiatto;
  quantita: number;
  ingredienti?: iIngrediente[];
  prezzoTotale: number;
}
