import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeServiceService {
  constructor() {}

  darkmode = false;

  modetoggle() {
    this.darkmode = !this.darkmode;
    document.documentElement.setAttribute(
      'data-theme',
      this.darkmode ? 'dark' : 'light'
    );
  }
}
