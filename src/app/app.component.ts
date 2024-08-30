import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './MainComponent/navbar/navbar.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { FooterComponent } from './MainComponent/footer/footer.component';
import { AuthComponent } from './auth/auth.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    HomepageComponent,
    AuthComponent,
    CatalogoComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
