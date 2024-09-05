import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { iLoginRequest } from '../Models/LoginRequest';
import { iRegisterRequest } from '../Models/RegisterRequest';
import { iLoginResponse } from '../Models/LoginResponse';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<any>(null);
  public isAuthenticated = computed(() => !!this.userSignal());

  constructor(private http: HttpClient, private router: Router) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSignal.set(JSON.parse(savedUser));
    }
  }

  register(userData: iRegisterRequest) {
    return this.http
      .post<any>('https://localhost:7223/register', userData)
      .pipe(
        tap((response) => {
          if (response && response.message) {
            console.log('Registrazione:', response.message);
          }
        }),
        catchError((error) => {
          alert('Errore durante la registrazione. Per favore, riprova.');
          return of(null);
        })
      );
  }

  login(credentials: iLoginRequest) {
    return this.http.post('https://localhost:7223/login', credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.saveUser(response);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return of(null);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSignal.set(null);
    this.router.navigate(['auth']);
  }

  private saveUser(user: iLoginResponse) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSignal.set(user);
  }

  getUserSignal() {
    return this.userSignal;
  }

  updateUser(userData: iRegisterRequest) {
    const currentUser = this.getUserSignal()();

    if (!currentUser || !currentUser.iD_Utente) {
      console.error('Errore: ID utente non trovato!');
      return of(null);
    }

    return this.http
      .put<any>(
        `https://localhost:7223/update/${currentUser.iD_Utente}`,
        userData
      )
      .pipe(
        tap((response) => {
          if (response) {
            console.log('Utente aggiornato nel database:', response);
            this.saveUser(response);
          }
        }),
        catchError((error) => {
          console.error("Errore durante l'aggiornamento utente:", error);
          return of(null);
        })
      );
  }
  deleteUser(userId: number): Observable<any> {
    return this.http
      .delete<any>(`https://localhost:7223/delete/${userId}`)
      .pipe(
        tap((response) => {
          console.log('Account eliminato con successo:', response);
        }),
        catchError((error) => {
          console.error("Errore durante l'eliminazione dell'account:", error);
          return of(null);
        })
      );
  }
}
