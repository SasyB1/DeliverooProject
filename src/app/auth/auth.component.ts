import { Component, OnInit, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { AuthService } from '../Services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
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
      email: [''],
      telefono: [''],
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
          if (response) {
            this.router.navigate(['/homepage']);
          }
        },
        (error) => {
          if (error.status === 401) {
            if (error.error === "L'account è stato cancellato.") {
              alert('Il tuo account è stato cancellato e non puoi accedere.');
            } else {
              alert('Credenziali non valide. Riprova.');
            }
          } else {
            alert('Errore durante il login. Per favore, riprova.');
          }
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
}
