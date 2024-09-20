import { iDettaglioOrdine } from './DettaglioOrdine';

export interface iOrdine {
  iD_Ordine: number;
  iD_Ristorante: number;
  dataOrdine: Date;
  stato: string;
  nomeRistorante: string;
  dettagliOrdine: iDettaglioOrdine[];
}
