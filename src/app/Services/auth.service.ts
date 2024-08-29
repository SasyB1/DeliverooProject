import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

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

  register(userData: any) {
    return this.http.post('https://localhost:7223/register', userData).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        return of(null);
      })
    );
  }

  login(credentials: any) {
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

  private saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSignal.set(user);
  }

  getUserSignal() {
    return this.userSignal;
  }
}
