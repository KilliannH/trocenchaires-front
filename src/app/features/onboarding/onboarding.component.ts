import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdresseService } from '../../core/services/adresse.service';

@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md">

        <div class="text-center mb-8">
          <span class="text-4xl">📍</span>
          <h1 class="text-2xl font-bold text-gray-900 mt-3">Votre adresse de retrait</h1>
          <p class="text-gray-500 text-sm mt-1">
            Elle sera utilisée par défaut pour vos articles en vente.
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rue *</label>
              <input formControlName="rue" type="text" placeholder="12 rue de la Paix"
                     class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                <input formControlName="codePostal" type="text" placeholder="44000" maxlength="5"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input formControlName="ville" type="text" placeholder="Nantes"
                       class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>

            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                {{ error() }}
              </div>
            }

            <button type="submit" [disabled]="loading() || form.invalid"
                    class="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm
                           hover:bg-indigo-700 transition-colors disabled:opacity-60">
              @if (loading()) { Enregistrement... } @else { Continuer → }
            </button>

            <button type="button" (click)="passer()"
                    class="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
              Passer pour l'instant
            </button>

          </form>
        </div>
      </div>
    </div>
  `,
})
export class OnboardingComponent {
  private fb = inject(FormBuilder);
  private adresseService = inject(AdresseService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    rue: ['', Validators.required],
    codePostal: ['', Validators.required],
    ville: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const v = this.form.value;
    this.adresseService.create({ rue: v.rue!, codePostal: v.codePostal!, ville: v.ville! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de l\'enregistrement.');
        this.loading.set(false);
      },
    });
  }

  passer() {
    this.router.navigate(['/']);
  }
}