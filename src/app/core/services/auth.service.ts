import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { RegisterRequest } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8080/api/auth';

  isLoggedIn = signal(!!localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  login(pseudo: string, motDePasse: string) {
    return this.http
      .post<{ token: string }>(`${this.api}/login`, { pseudo, motDePasse })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          this.isLoggedIn.set(true);
        })
      );
  }

  register(data: RegisterRequest) {
    return this.http.post(`${this.api}/register`, data).pipe(
      // Après inscription, on login automatiquement puis on redirige vers onboarding
      switchMap(() => this.login(data.pseudo, data.motDePasse)),
      tap(() => this.router.navigate(['/onboarding']))
    );
}

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  getPseudo(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
