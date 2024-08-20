import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(private translate: TranslateService) {}

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
    this.changeLanguage(selectedLanguage);
  }

  changeLanguage(language: string) {
    this.translate.use(language);
  }
}
