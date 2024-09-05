import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { AuthComponent } from './auth/auth.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { AccountComponent } from './pages/account/account.component';
import { RestaurantComponent } from './pages/account/restaurant/restaurant.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'homepage' },
  { path: 'homepage', component: HomepageComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'catalogo', component: CatalogoComponent },
  {
    path: 'account',
    component: AccountComponent,
    children: [
      {
        path: 'restaurant',
        component: RestaurantComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'homepage' },
];
