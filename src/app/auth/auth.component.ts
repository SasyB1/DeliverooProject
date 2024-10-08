import { Component, OnInit, Signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
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
      email: [
        '',
        [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)],
      ],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
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
          Swal.fire({
            title: 'Registrazione completata!',
            text: 'Verrai reindirizzato alla homepage.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            this.router.navigate(['/homepage']);
          });
        } else {
          Swal.fire({
            title: 'Errore di Registrazione',
            text: "L'email è già registrata. Usa un'altra email.",
            icon: 'error',
            showConfirmButton: true,
          });
        }
      });
    }
  }

  onSignIn() {
    if (this.signInForm.valid) {
      this.authService.login(this.signInForm.value).subscribe(
        (response) => {
          if (response && !response.error) {
            const ruolo = response.ruolo;
            if (ruolo == '2') {
              this.router.navigate(['/account/restaurant']);
            } else {
              this.router.navigate(['/homepage']);
            }
          } else if (response && response.error) {
            Swal.fire({
              title: 'Errore di Login',
              text: response.message,
              icon: 'error',
              showConfirmButton: true,
            });
          }
        },
        (error) => {
          Swal.fire({
            title: 'Errore di Login',
            text: 'Si è verificato un errore durante il login.',
            icon: 'error',
            showConfirmButton: true,
          });
        }
      );
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
  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }
}
