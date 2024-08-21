import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { ThemeServiceService } from '../../Services/theme-service.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(
    private translate: TranslateService,
    private themeSvc: ThemeServiceService
  ) {}

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
    this.changeLanguage(selectedLanguage);
  }

  changeLanguage(language: string) {
    this.translate.use(language);
  }
  toggleDarkMode() {
    this.themeSvc.modetoggle();
  }
}
