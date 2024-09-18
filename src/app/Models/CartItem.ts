import { iIngrediente } from './Ingrediente';
import { iPiatto } from './Piatto';

interface CartItem {
  piatto: iPiatto;
  quantita: number;
  ingredienti: iIngrediente[];
  prezzoTotale: number;
}
