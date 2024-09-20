import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userForm!: FormGroup;
  deleteAccountForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUserSignal()();
    if (!user || !user.iD_Utente) {
      console.error('Errore: Utente non trovato o ID utente non disponibile');
      return;
    }

    const ruoloMapped = user.ruolo === 0 ? 'Ospite' : 'Ristoratore';

    const ruoloControl = new FormControl({
      value: ruoloMapped,
      disabled: ruoloMapped === 'Ristoratore',
    });

    this.userForm = this.fb.group({
      nome: [user?.nome],
      cognome: [user?.cognome],
      email: [user?.email],
      telefono: [user?.telefono],
      ruolo: ruoloControl,
      password: [user?.password],
    });

    this.deleteAccountForm = this.fb.group({
      confirmDelete: ['', Validators.required],
    });
  }

  isRestaurantRoute(): boolean {
    return this.router.url.includes('restaurant');
  }

  onUpdate() {
    if (this.userForm.valid) {
      const formData = this.userForm.getRawValue();

      console.log('Dati inviati:', formData);

      this.authService.updateUser(formData).subscribe(
        (response) => {
          if (response) {
            console.log('Utente aggiornato con successo:', response);
            alert('Dati aggiornati con successo');
          }
        },
        (error) => {
          console.error("Errore durante l'aggiornamento utente:", error);
          alert("Errore durante l'aggiornamento utente");
        }
      );
    }
  }

  onDeleteAccount() {
    if (this.deleteAccountForm.get('confirmDelete')?.value === 'CANCELLA') {
      const userId = this.authService.getUserSignal()().iD_Utente;

      this.authService.deleteUser(userId).subscribe(
        (response) => {
          console.log('Account eliminato con successo:', response);
          alert('Account eliminato con successo');
          this.authService.logout();
          this.router.navigate(['/auth']);
        },
        (error) => {
          console.error("Errore durante l'eliminazione dell'account:", error);
          alert("Errore durante l'eliminazione dell'account");
        }
      );
    } else {
      alert('Devi digitare "CANCELLA" per confermare l\'eliminazione.');
    }
  }
}
