import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { iRegisterRequest } from '../../Models/RegisterRequest';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userForm!: FormGroup;

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit() {
    const user = this.authService.getUserSignal()();
    if (!user || !user.iD_Utente) {
      console.error('Errore: Utente non trovato o ID utente non disponibile');
      return;
    }

    this.userForm = this.fb.group({
      nome: [user?.nome],
      cognome: [user?.cognome],
      email: [user?.email],
      telefono: [user?.telefono],
      ruolo: [user?.ruolo || 'Ospite', []],
      password: [user?.password],
    });
  }

  onUpdate() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

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
}
