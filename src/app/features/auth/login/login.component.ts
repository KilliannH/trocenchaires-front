import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md">

        <div class="text-center mb-8">
          <span class="text-4xl">🏷️</span>
          <h1 class="text-2xl font-bold text-gray-900 mt-3">Connexion</h1>
          <p class="text-gray-500 text-sm mt-1">Accédez à votre compte TrocEnchères</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pseudo</label>
              <input
                formControlName="pseudo"
                type="text"
                autocomplete="username"
                placeholder="votre_pseudo"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                formControlName="motDePasse"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>

            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm
                     hover:bg-indigo-700 transition-colors disabled:opacity-60">
              @if (loading()) { Connexion... } @else { Se connecter }
            </button>

          </form>
        </div>

        <p class="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?
          <a routerLink="/register" class="text-indigo-600 font-medium hover:underline">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    pseudo: ['', Validators.required],
    motDePasse: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { pseudo, motDePasse } = this.form.value;
    this.auth.login(pseudo!, motDePasse!).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.status === 401 ? 'Pseudo ou mot de passe incorrect.' : 'Erreur de connexion.');
        this.loading.set(false);
      },
    });
  }
}
