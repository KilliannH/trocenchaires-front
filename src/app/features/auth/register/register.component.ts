import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">

        <div class="text-center mb-8">
          <span class="text-4xl">🏷️</span>
          <h1 class="text-2xl font-bold text-gray-900 mt-3">Créer un compte</h1>
          <p class="text-gray-500 text-sm mt-1">Rejoignez TrocEnchères gratuitement</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pseudo *</label>
              <input
                formControlName="pseudo"
                type="text"
                placeholder="votre_pseudo_unique"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              @if (hasError('pseudo', 'required')) {
                <p class="text-xs text-red-500 mt-1">Requis</p>
              }
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  formControlName="nom"
                  type="text"
                  placeholder="Dupont"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  formControlName="prenom"
                  type="text"
                  placeholder="Marie"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                formControlName="email"
                type="email"
                placeholder="marie@exemple.fr"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              @if (hasError('email', 'email')) {
                <p class="text-xs text-red-500 mt-1">Email invalide</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <input
                formControlName="telephone"
                type="tel"
                placeholder="0612345678"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input
                formControlName="motDePasse"
                type="password"
                placeholder="8 caractères minimum"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              @if (hasError('motDePasse', 'minlength')) {
                <p class="text-xs text-red-500 mt-1">8 caractères minimum</p>
              }
            </div>

            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                {{ error() }}
              </div>
            }

            @if (success()) {
              <div class="bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-lg text-sm">
                Compte créé ! Redirection vers la connexion...
              </div>
            }

            <button
              type="submit"
              [disabled]="loading() || form.invalid"
              class="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm
                     hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2">
              @if (loading()) { Création... } @else { Créer mon compte }
            </button>

          </form>
        </div>

        <p class="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?
          <a routerLink="/login" class="text-indigo-600 font-medium hover:underline">Se connecter</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    pseudo: ['', Validators.required],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
  });

  hasError(field: string, errorType: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(errorType) && ctrl?.touched);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    const v = this.form.value;
    this.auth
      .register({
        pseudo: v.pseudo!,
        nom: v.nom!,
        prenom: v.prenom!,
        email: v.email!,
        telephone: v.telephone!,
        motDePasse: v.motDePasse!,
      })
      .subscribe({
        next: () => {
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Ce pseudo est peut-être déjà utilisé.');
          this.loading.set(false);
        },
      });
  }
}
