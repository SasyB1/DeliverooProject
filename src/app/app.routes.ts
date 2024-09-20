import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { AuthComponent } from './auth/auth.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { AccountComponent } from './pages/account/account.component';
import { RestaurantComponent } from './pages/account/restaurant/restaurant.component';
import { RestaurantDetailsComponent } from './pages/account/restaurant/restaurant-details/restaurant-details.component';
import { RestaurantViewComponent } from './pages/catalogo/catalogoComponent/restaurant-view/restaurant-view.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { RecensioneComponent } from './pages/recensione/recensione.component';
import { StoricoComponent } from './pages/storico/storico.component';
import { GestioneComponent } from './pages/gestione/gestione.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'homepage' },
  { path: 'homepage', component: HomepageComponent, canActivate: [roleGuard] },
  { path: 'auth', component: AuthComponent },
  {
    path: 'catalogo',
    component: CatalogoComponent,
    children: [
      {
        path: 'details/:id',
        component: RestaurantViewComponent,
      },
    ],
  },
  {
    path: 'account',
    component: AccountComponent,
    children: [
      {
        path: 'restaurant',
        component: RestaurantComponent,
      },
      {
        path: 'restaurant/details/:id',
        component: RestaurantDetailsComponent,
      },
    ],
  },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'recensione', component: RecensioneComponent },
  { path: 'storico', component: StoricoComponent },
  { path: 'gestione/:id', component: GestioneComponent },
  { path: '**', redirectTo: 'homepage' },
];
