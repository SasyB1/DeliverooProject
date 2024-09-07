import { iPiatto } from './Piatto';

export interface iMenu {
  iD_Menu: number;
  nome: string;
  piatti: iPiatto[];
}
