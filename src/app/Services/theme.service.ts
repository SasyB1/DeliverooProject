import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  darkmode = false;

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkmode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  modetoggle() {
    this.darkmode = !this.darkmode;
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.darkmode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}
