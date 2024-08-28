import { Component, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../Services/theme.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslateModule, FormsModule, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  languageSignal = signal<string>(this.translate.getDefaultLang());
  isAuthenticated = this.authSvc.isAuthenticated;

  constructor(
    public translate: TranslateService,
    public themeSvc: ThemeService,
    private authSvc: AuthService
  ) {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.changeLanguage(savedLanguage);
    } else {
      this.changeLanguage(this.languageSignal());
    }
  }

  get userEmail(): string | null {
    const user = this.authSvc.getUserSignal()();
    return user ? user.email : null;
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
