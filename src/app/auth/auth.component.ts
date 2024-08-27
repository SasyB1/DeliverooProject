import { Component, OnInit, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  signUpForm: FormGroup;
  signInForm: FormGroup;
  userSignal: Signal<any>;
  container: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      nome: [''],
      cognome: [''],
      email: [''],
      telefono: [''],
      indirizzo: [''],
      password: [''],
      ruolo: [''],
    });

    this.signInForm = this.fb.group({
      email: [''],
      password: [''],
    });
    this.userSignal = this.authService.getUserSignal();
  }

  onSignUp() {
    if (this.signUpForm.valid) {
      this.authService.register(this.signUpForm.value).subscribe((response) => {
        if (response) {
          this.router.navigate(['/auth']);
        }
      });
    }
  }

  onSignIn() {
    if (this.signInForm.valid) {
      this.authService.login(this.signInForm.value).subscribe((response) => {
        if (response) {
          this.router.navigate(['/homepage']);
        }
      });
    }
  }

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
