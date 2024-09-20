import { iIngredienteDettaglio } from './IngredienteDettaglio';
import { iPiatto } from './Piatto';

export interface iDettaglioOrdine {
  id_DettaglioOrdine: number;
  piatto: iPiatto;
  quantita: number;
  prezzo: number;
  ingredienti?: iIngredienteDettaglio[];
}
