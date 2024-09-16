import { iCategoria } from './Category';
import { iMenu } from './Menu';
import { iOpeningHours } from './OpeningHours';
import { iPromotion } from './Promotion';
import { iRestaurant } from './Restaurant';

export interface iRestaurantDetails {
  ristorante: iRestaurant;
  menus: iMenu[];
  promozioni: iPromotion[];
  categorie: iCategoria[];
}
