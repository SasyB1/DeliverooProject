import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  container: HTMLElement | null = null;

  ngOnInit() {
    this.container = document.getElementById('container');
    if (this.container) {
      setTimeout(() => {
        this.container!.classList.add('sign-in');
      }, 100);
    }
  }

  toggle() {
    if (this.container) {
      this.container.classList.toggle('sign-in');
      this.container.classList.toggle('sign-up');
    }
  }
}
