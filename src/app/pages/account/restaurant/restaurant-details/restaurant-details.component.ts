import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../../../Services/menu.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { iMenu } from '../../../../Models/Menu';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.scss',
})
export class RestaurantDetailsComponent implements OnInit {
  restaurantId!: number;
  menus: iMenu[] = [];
  newMenuName: string = '';
  newPiattoData: {
    [key: number]: { name: string; description: string; price: number | null };
  } = {};

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.restaurantId = +id;
    } else {
      console.error('ID ristorante non trovato nella URL');
    }
    this.loadMenus();
  }

  loadMenus(): void {
    this.menuService
      .getMenusByRestaurant(this.restaurantId)
      .subscribe((menus: iMenu[]) => {
        this.menus = menus;

        this.menus.forEach((menu: iMenu) => {
          if (!this.newPiattoData[menu.iD_Menu]) {
            this.newPiattoData[menu.iD_Menu] = {
              name: '',
              description: '',
              price: null,
            };
          }
          this.menuService.getPiattiByMenu(menu.iD_Menu).subscribe(
            (piatti) => {
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
      });
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
      this.menuService
        .createPiatto(piatto.name, piatto.description, piatto.price, menuId)
        .subscribe(
          () => {
            this.newPiattoData[menuId] = {
              name: '',
              description: '',
              price: null,
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
}
