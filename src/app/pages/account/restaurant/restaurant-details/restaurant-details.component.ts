import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MenuService } from '../../../../Services/menu.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { iMenu } from '../../../../Models/Menu';
import { iCategoria } from '../../../../Models/Category';
import { RestaurantService } from '../../../../Services/Restaurant.service';
import { iPiatto } from '../../../../Models/Piatto';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './restaurant-details.component.html',
  styleUrls: ['./restaurant-details.component.scss'],
})
export class RestaurantDetailsComponent implements OnInit {
  restaurantId!: number;
  menus: iMenu[] = [];
  newMenuName: string = '';
  newPiattoData: {
    [key: number]: {
      name: string;
      description: string;
      price: number | null;
      immagine: File | null;
      consenteIngredienti: boolean;
    };
  } = {};

  categorie: iCategoria[] = [];
  selectedCategories: number[] = [];
  piattoInHover: number | null = null;
  selectedPiatto: iPiatto | null = null;

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.restaurantId = +id;
      this.loadMenus();
      this.loadCategories();
      this.loadAssociatedCategories();
    } else {
      console.error('ID ristorante non trovato nella URL');
    }
  }

  loadMenus(): void {
    this.menuService.getMenusByRestaurant(this.restaurantId).subscribe(
      (menus: iMenu[]) => {
        this.menus = menus;
        if (this.menus.length === 0) {
          console.log('Nessun menu trovato per questo ristorante.');
        } else {
          this.menus.forEach((menu: iMenu) => {
            if (!this.newPiattoData[menu.iD_Menu]) {
              this.newPiattoData[menu.iD_Menu] = {
                name: '',
                description: '',
                price: null,
                immagine: null,
                consenteIngredienti: false,
              };
            }
            this.menuService.getPiattiByMenu(menu.iD_Menu).subscribe(
              (piatti) => {
                console.log(
                  `Piatti caricati per il menu ${menu.iD_Menu}:`,
                  piatti
                );
                piatti.forEach((piatto) => {
                  console.log(
                    `Valore consenteIngredienti per il piatto:`,
                    piatto.consenteIngredienti
                  );
                });
                menu.piatti = piatti;
              },
              (error) => {
                if (error.status === 404) {
                  console.error(
                    `Nessun piatto trovato per il menu ${menu.iD_Menu}`
                  );
                  menu.piatti = [];
                } else {
                  console.error(
                    `Errore durante il recupero dei piatti per il menu ${menu.iD_Menu}:`,
                    error
                  );
                }
              }
            );
          });
        }
      },
      (error) => {
        console.error('Errore durante il recupero dei menu:', error);
      }
    );
  }

  loadCategories(): void {
    this.restaurantService.getCategories().subscribe((categories) => {
      this.categorie = categories;
    });
  }
  loadAssociatedCategories(): void {
    this.restaurantService
      .getCategorieAssociate(this.restaurantId)
      .subscribe((associatedCategories) => {
        this.selectedCategories = associatedCategories;
      });
  }

  onCategoryChange(event: any, categoryId: number): void {
    if (event.target.checked) {
      this.selectedCategories.push(categoryId);
    } else {
      const index = this.selectedCategories.indexOf(categoryId);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      }
    }
  }

  addCategoriesToRestaurant(): void {
    if (this.selectedCategories.length > 0) {
      this.restaurantService
        .aggiornaCategorieRistorante(this.restaurantId, this.selectedCategories)
        .subscribe(
          () => {
            console.log('Categorie aggiornate con successo');
          },
          (error) => {
            console.error(
              "Errore durante l'aggiornamento delle categorie:",
              error
            );
          }
        );
    } else {
      console.error('Nessuna categoria selezionata.');
    }
  }

  createMenu(): void {
    if (this.newMenuName) {
      this.menuService
        .createMenu(this.newMenuName, this.restaurantId)
        .subscribe(() => {
          this.newMenuName = '';
          this.loadMenus();
        });
    }
  }

  createPiatto(menuId: number): void {
    console.log('menuId ricevuto:', menuId);
    const piatto = this.newPiattoData[menuId];

    if (
      menuId &&
      piatto &&
      piatto.name &&
      piatto.description &&
      piatto.price !== null
    ) {
      const formData = new FormData();
      formData.append('nome', piatto.name);
      formData.append('descrizione', piatto.description);
      formData.append('prezzo', piatto.price.toString());
      formData.append('idMenu', menuId.toString());
      formData.append(
        'consenteIngredienti',
        piatto.consenteIngredienti ? 'true' : 'false'
      ); // Nuova proprietà

      if (piatto.immagine) {
        formData.append('immagine', piatto.immagine);
      }

      this.menuService.createPiattoWithImage(formData).subscribe(
        () => {
          this.newPiattoData[menuId] = {
            name: '',
            description: '',
            price: null,
            immagine: null,
            consenteIngredienti: false, // Resetta la proprietà
          };
          this.loadMenus();
        },
        (error) => {
          console.error('Errore durante la creazione del piatto:', error);
        }
      );
    } else {
      console.error('Dati del piatto incompleti o non validi', piatto);
    }
  }

  onFileSelected(event: any, menuId: number): void {
    const file: File = event.target.files[0];
    if (file) {
      this.newPiattoData[menuId].immagine = file;
    }
  }
  onFileSelectedForUpdate(event: any, menuId: number, piattoId: number): void {
    const file: File = event.target.files[0];
    if (file) {
      console.log("File selezionato per l'aggiornamento:", file);
      const menu = this.menus.find((menu) => menu.iD_Menu === menuId);
      const piatto = menu?.piatti.find((p) => p.iD_Piatto === piattoId);

      if (piatto) {
        piatto.immagine = file;
        console.log(
          "Immagine associata al piatto per l'update:",
          piatto.immagine
        );
      } else {
        console.log('Piatto non trovato');
      }
    } else {
      console.log("Nessun file selezionato per l'aggiornamento");
    }
  }

  getImageUrl(immaginePath: string | null): string {
    return this.menuService.getImageUrl(immaginePath);
  }

  deletePiatto(id: number, menuId: number): void {
    console.log('Eliminazione del piatto con ID:', id);
    if (id && confirm('Sei sicuro di voler eliminare questo piatto?')) {
      this.menuService.deletePiatto(id).subscribe(
        () => {
          console.log(`Piatto ${id} eliminato con successo`);
          this.loadMenus();
        },
        (error) => {
          console.error(
            `Errore durante l'eliminazione del piatto ${id}:`,
            error
          );
        }
      );
    } else {
      console.error('ID piatto non valido o non definito');
    }
  }

  setPiattoHover(idPiatto: number | null): void {
    this.piattoInHover = idPiatto;
  }
  deleteMenu(idMenu: number): void {
    if (idMenu && confirm('Sei sicuro di voler eliminare questo menu?')) {
      this.menuService.deleteMenu(idMenu).subscribe(
        () => {
          console.log(`Menu ${idMenu} eliminato con successo`);
          this.loadMenus();
        },
        (error) => {
          console.error(
            `Errore durante l'eliminazione del menu ${idMenu}:`,
            error
          );
        }
      );
    }
  }
  updateMenu(idMenu: number): void {
    const menu = this.menus.find((m) => m.iD_Menu === idMenu);
    if (menu && menu.nome.trim()) {
      this.menuService.updateMenu(idMenu, menu.nome).subscribe(
        () => {
          this.loadMenus();
        },
        (error) => {
          console.error('Errore durante la modifica del menu:', error);
        }
      );
    } else {
      console.error('Nome del menu non valido.');
    }
  }
  updatePiatto(piattoId: number, menuId: number): void {
    const piatto = this.menus
      .find((menu) => menu.iD_Menu === menuId)
      ?.piatti.find((piatto) => piatto.iD_Piatto === piattoId);

    if (piatto && piatto.nome && piatto.descrizione && piatto.prezzo !== null) {
      console.log(
        'Valore consenteIngredienti prima di aggiornare il piatto:',
        piatto.consenteIngredienti
      );

      const formData = new FormData();
      formData.append('idPiatto', piattoId.toString());
      formData.append('nome', piatto.nome);
      formData.append('descrizione', piatto.descrizione);
      formData.append('prezzo', piatto.prezzo.toString());
      formData.append(
        'consenteIngredienti',
        piatto.consenteIngredienti ? 'true' : 'false'
      );

      if (piatto.immagine) {
        formData.append('immagine', piatto.immagine);
      }

      this.menuService.updatePiatto(formData).subscribe(
        () => {
          this.loadMenus();
          console.log('Piatto aggiornato con successo.');
        },
        (error) => {
          console.error("Errore durante l'aggiornamento del piatto:", error);
        }
      );
    } else {
      console.error('Dati del piatto incompleti o non validi.');
    }
  }
}
