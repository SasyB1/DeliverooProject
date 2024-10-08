import { iOpeningHours } from './OpeningHours';

export interface iRestaurant {
  iD_Ristorante?: number;
  nome: string;
  indirizzo: string;
  telefono: string;
  email: string;
  ID_Utente: number;
  latitudine: number;
  longitudine: number;
  orariApertura: iOpeningHours[];
  immaginePath: string;
}
