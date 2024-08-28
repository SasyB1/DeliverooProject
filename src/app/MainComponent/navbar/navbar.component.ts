import { Component, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../Services/theme.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslateModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  languageSignal = signal<string>(this.translate.getDefaultLang());

  constructor(
    public translate: TranslateService,
    public themeSvc: ThemeService
  ) {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.changeLanguage(savedLanguage);
    } else {
      this.changeLanguage(this.languageSignal());
    }
  }

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
    this.changeLanguage(selectedLanguage);
  }

  changeLanguage(language: string): void {
    this.languageSignal.set(language);
    this.translate.use(language);
    localStorage.setItem('language', language);
  }

  toggleDarkMode() {
    this.themeSvc.modetoggle();
  }
}
