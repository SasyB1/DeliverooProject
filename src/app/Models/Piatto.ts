export interface iPiatto {
  iD_Piatto: number;
  nome: string;
  descrizione: string;
  prezzo: number;
  immaginePath: string;
  cancellato: boolean;
  immagine?: File | null;
}
