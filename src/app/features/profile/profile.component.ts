import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ArticleService } from '../../core/services/article.service';
import { ArticleAVendre, Enchere } from '../../core/models/article.model';
import { StatutPipe } from '../../shared/pipes/statut.pipe';
import { DatePipe } from '@angular/common';
import { AdresseService } from '../../core/services/adresse.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, StatutPipe, DatePipe, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p class="text-gray-500 mt-1">Connecté en tant que <span class="font-medium text-indigo-600">{{ auth.getPseudo() }}</span></p>
        </div>
        <button
          (click)="auth.logout()"
          class="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg transition-colors">
          Déconnexion
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Mes articles -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-gray-800">Mes articles en vente</h2>
            <a routerLink="/articles/creer"
               class="text-xs text-indigo-600 hover:underline font-medium">
              + Nouveau
            </a>
          </div>

          @if (mesArticles().length === 0) {
            <div class="text-center py-10 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              Vous n'avez pas encore mis d'article en vente.
              <br/>
              <a routerLink="/articles/creer" class="text-indigo-600 hover:underline mt-1 inline-block">
                Mettre un article en vente
              </a>
            </div>
          } @else {
            <div class="space-y-3">
              @for (article of mesArticles(); track article.id) {
                <a [routerLink]="['/articles', article.id]"
                   class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                  <div class="min-w-0">
                    <p class="font-medium text-gray-800 text-sm truncate">{{ article.nom }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">
                      Fin le {{ article.dateFinEncheres | date:'dd/MM/yyyy' }}
                      · {{ article.encheres?.length ?? 0 }} enchère(s)
                    </p>
                  </div>
                  <div class="text-right ml-4 shrink-0">
                    <p class="font-bold text-indigo-600 text-sm">{{ article.prixVente }} €</p>
                    <span class="text-xs text-gray-400">{{ article.statut | statut }}</span>
                  </div>
                </a>
              }
            </div>
          }
        </div>

        <!-- Mes enchères -->
        <div>
          <h2 class="font-semibold text-gray-800 mb-4">Mes enchères placées</h2>

          @if (mesEncheres().length === 0) {
            <div class="text-center py-10 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              Vous n'avez pas encore placé d'enchère.
              <br/>
              <a routerLink="/" class="text-indigo-600 hover:underline mt-1 inline-block">
                Parcourir les enchères
              </a>
            </div>
          } @else {
            <div class="space-y-3">
              @for (e of mesEncheres(); track e.id) {
                <a [routerLink]="['/articles', e.articleAVendre?.id]"
                   class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                  <div>
                    <p class="font-medium text-gray-800 text-sm">{{ e.articleAVendre?.nom }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ e.date | date:'dd/MM/yyyy à HH:mm' }}</p>
                  </div>
                  <span class="font-bold text-indigo-600 text-sm ml-4 shrink-0">{{ e.montant }} €</span>
                </a>
              }
            </div>
          }
        </div>

        <!-- Adresse de retrait -->
        <div class="mt-8">
          <h2 class="font-semibold text-gray-800 mb-4">Mon adresse de retrait</h2>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <form [formGroup]="adresseForm" (ngSubmit)="saveAdresse()" class="space-y-4">

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                <input formControlName="rue" type="text" placeholder="12 rue de la Paix"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input formControlName="codePostal" type="text" maxlength="5" placeholder="44000"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input formControlName="ville" type="text" placeholder="Nantes"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>

              @if (adresseError()) {
                <p class="text-sm text-red-500">{{ adresseError() }}</p>
              }
              @if (adresseSuccess()) {
                <p class="text-sm text-green-600 font-medium">✓ Adresse sauvegardée</p>
              }

              <button type="submit" [disabled]="adresseLoading() || adresseForm.invalid"
                      class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm
                            hover:bg-indigo-700 transition-colors disabled:opacity-60">
                @if (adresseLoading()) { Sauvegarde... } @else { Sauvegarder }
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private articleService = inject(ArticleService);
  private adresseService = inject(AdresseService);
  private fb = inject(FormBuilder);

  mesArticles = signal<ArticleAVendre[]>([]);
  mesEncheres = signal<Enchere[]>([]);

  adresseForm = this.fb.group({
  rue: ['', Validators.required],
  codePostal: ['', Validators.required],
  ville: ['', Validators.required],
  });
  adresseLoading = signal(false);
  adresseSuccess = signal(false);
  adresseError = signal<string | null>(null);
  hasAdresse = signal(false);

  ngOnInit() {
    // Charger tous les articles et filtrer côté client (en attendant un endpoint /api/articles/mes-articles)
    this.articleService.getAll(0, 100).subscribe({
      next: (page) => {
        const pseudo = this.auth.getPseudo();
        this.mesArticles.set(
          page.content.filter((a) => a.vendeur?.pseudo === pseudo)
        );
      },
    });
    this.adresseService.get().subscribe({
      next: (adresse) => {
        this.hasAdresse.set(true);
        this.adresseForm.patchValue(adresse);
      },
      error: () => this.hasAdresse.set(false),
    });
  }

  saveAdresse() {
    if (this.adresseForm.invalid) return;
    this.adresseLoading.set(true);
    this.adresseError.set(null);
    this.adresseSuccess.set(false);
    const v = this.adresseForm.value;
    const req = { rue: v.rue!, codePostal: v.codePostal!, ville: v.ville! };
    const call$ = this.hasAdresse() ? this.adresseService.update(req) : this.adresseService.create(req);
    call$.subscribe({
      next: () => {
        this.hasAdresse.set(true);
        this.adresseSuccess.set(true);
        this.adresseLoading.set(false);
      },
      error: () => {
        this.adresseError.set('Erreur lors de la sauvegarde.');
        this.adresseLoading.set(false);
      },
    });
  }
}
