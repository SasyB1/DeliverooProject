import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { iLoginRequest } from '../Models/LoginRequest';
import { iRegisterRequest } from '../Models/RegisterRequest';
import { iLoginResponse } from '../Models/LoginResponse';
import jwt_decode from 'jwt-decode';

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
          if (error.status === 409) {
            alert("L'email è già registrata. Per favore, usa un'altra email.");
          } else {
            alert('Errore durante la registrazione. Per favore, riprova.');
          }
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
        console.log('Errore durante il login:', error);

        if (
          error.status === 401 &&
          error.error &&
          error.error.message === "L'account è stato cancellato."
        ) {
          alert('Account eliminato.');
        } else {
          console.error('Login error:', error);
          alert('Credenziali non valide. Riprova.');
        }
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
  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
  checkTokenExpiration() {
    const user = this.userSignal();
    if (user && user.token) {
      const decodedToken: any = this.decodeToken(user.token);
      const expirationDate = decodedToken.exp * 1000;
      if (Date.now() > expirationDate) {
        this.logout();
      }
    }
  }
}
