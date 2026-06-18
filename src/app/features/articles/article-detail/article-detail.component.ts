import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleAVendre, Enchere } from '../../../core/models/article.model';
import { StatutPipe } from '../../../shared/pipes/statut.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, FormsModule, StatutPipe, DatePipe],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">

      <!-- Retour -->
      <a routerLink="/" class="text-sm text-indigo-600 hover:underline flex items-center gap-1 mb-6">
        ← Retour aux enchères
      </a>

      @if (loading()) {
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-gray-100 rounded w-1/2"></div>
          <div class="h-48 bg-gray-100 rounded"></div>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{{ error() }}</div>
      }

      @if (article(); as a) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Colonne gauche : détails -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Titre + statut -->
            <div>
              <div class="flex items-start justify-between gap-4">
                <h1 class="text-2xl font-bold text-gray-900">{{ a.nom }}</h1>
                <span [class]="statutClass(a.statut)">{{ a.statut | statut }}</span>
              </div>
              <p class="text-sm text-gray-400 mt-1">
                Catégorie : <span class="font-medium text-gray-600">{{ a.categorie?.libelle }}</span>
              </p>
            </div>

            <!-- Image placeholder -->
            <div class="h-52 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
              @if (article()?.imageUrl) {
                <img [src]="article()!.imageUrl" [alt]="article()!.nom"
                    class="w-full h-full object-cover rounded-xl" />
              } @else {
                <span class="text-6xl">📦</span>
              }
            </div>

            <!-- Description -->
            <div>
              <h2 class="font-semibold text-gray-700 mb-2">Description</h2>
              <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ a.description }}</p>
            </div>

            <!-- Infos retrait -->
            @if (a.retrait) {
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h2 class="font-semibold text-gray-700 mb-1">📍 Retrait</h2>
                <p class="text-sm text-gray-600">
                  {{ a.retrait.rue }}, {{ a.retrait.codePostal }} {{ a.retrait.ville }}
                </p>
              </div>
            }

            <!-- Historique des enchères -->
            <div>
              <h2 class="font-semibold text-gray-700 mb-3">
                Historique des enchères
                @if (encheres().length > 0) {
                  <span class="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                    {{ encheres().length }}
                  </span>
                }
              </h2>

              @if (encheres().length === 0) {
                <p class="text-gray-400 text-sm py-4 text-center border border-dashed border-gray-200 rounded-lg">
                  Aucune enchère pour le moment. Soyez le premier !
                </p>
              } @else {
                <div class="space-y-2">
                  @for (e of encheres(); track e.id; let i = $index) {
                    <div [class]="i === 0
                      ? 'flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg'
                      : 'flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-lg'">
                      <div class="flex items-center gap-3">
                        @if (i === 0) {
                          <span class="text-sm">🏆</span>
                        }
                        <div>
                          <p class="text-sm font-medium text-gray-800">{{ e.acquereur.pseudo }}</p>
                          <p class="text-xs text-gray-400">{{ e.date | date:'dd/MM/yyyy à HH:mm' }}</p>
                        </div>
                      </div>
                      <span [class]="i === 0
                        ? 'font-bold text-indigo-600'
                        : 'font-semibold text-gray-600'">
                        {{ e.montant }} €
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Colonne droite : enchérir -->
          <div class="space-y-4">

            <!-- Carte prix -->
            <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p class="text-sm text-gray-400 mb-1">Prix initial</p>
              <p class="text-gray-600 font-medium mb-4">{{ a.prixInitial }} €</p>

              <p class="text-sm text-gray-400 mb-1">Prix actuel</p>
              <p class="text-3xl font-bold text-indigo-600 mb-2">{{ a.prixVente }} €</p>

              <div class="text-xs text-gray-400 space-y-1 border-t border-gray-100 pt-3 mb-5">
                <p>Début : <span class="font-medium text-gray-600">{{ a.dateDebutEncheres | date:'dd/MM/yyyy' }}</span></p>
                <p>Fin : <span class="font-medium text-gray-600">{{ a.dateFinEncheres | date:'dd/MM/yyyy' }}</span></p>
              </div>

              @if (peutEncherir(a)) {
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium text-gray-700 block mb-1">
                      Votre offre (min. {{ a.prixVente + 1 }} €)
                    </label>
                    <input
                      type="number"
                      [(ngModel)]="montantEnchere"
                      [min]="a.prixVente + 1"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>

                  @if (enchereError()) {
                    <p class="text-xs text-red-500">{{ enchereError() }}</p>
                  }
                  @if (enchereSuccess()) {
                    <p class="text-xs text-green-600 font-medium">✓ Enchère placée avec succès !</p>
                  }

                  <button
                    (click)="placerEnchere(a)"
                    [disabled]="enchereLoading()"
                    class="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm
                           hover:bg-indigo-700 transition-colors disabled:opacity-60">
                    @if (enchereLoading()) { Envoi... } @else { Enchérir }
                  </button>
                </div>
              } @else if (!auth.isLoggedIn()) {
                <a routerLink="/login"
                   class="block w-full text-center bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
                  Se connecter pour enchérir
                </a>
              } @else if (auth.getPseudo() === a.vendeur?.pseudo) {
                <p class="text-sm text-gray-400 text-center py-2">Vous êtes le vendeur</p>
              } @else {
                <p class="text-sm text-gray-400 text-center py-2">Enchères fermées</p>
              }
            </div>

            <!-- Vendeur -->
            <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p class="text-xs text-gray-400 mb-1">Vendeur</p>
              <p class="font-semibold text-gray-800">{{ a.vendeur?.pseudo }}</p>
              @if (a.vendeur?.email) {
                <p class="text-xs text-gray-500 mt-0.5">{{ a.vendeur.email }}</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  auth = inject(AuthService);

  article = signal<ArticleAVendre | null>(null);
  encheres = signal<Enchere[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  montantEnchere = 0;
  enchereLoading = signal(false);
  enchereError = signal<string | null>(null);
  enchereSuccess = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.articleService.getById(id).subscribe({
      next: (a) => {
        this.article.set(a);
        this.montantEnchere = a.prixVente + 1;
        this.loading.set(false);
        this.loadEncheres(id);
      },
      error: () => {
        this.error.set('Article introuvable.');
        this.loading.set(false);
      },
    });
  }

  loadEncheres(id: number) {
    this.articleService.getEncheres(id).subscribe({
      next: (e) => this.encheres.set(e),
    });
  }

  peutEncherir(a: ArticleAVendre): boolean {
    if (!this.auth.isLoggedIn()) return false;
    if (this.auth.getPseudo() === a.vendeur?.pseudo) return false;
    const today = new Date();
    const debut = new Date(a.dateDebutEncheres);
    const fin = new Date(a.dateFinEncheres);
    return today >= debut && today <= fin;
  }

  placerEnchere(a: ArticleAVendre) {
    this.enchereError.set(null);
    this.enchereSuccess.set(false);

    if (this.montantEnchere <= a.prixVente) {
      this.enchereError.set(`L'offre doit être supérieure au prix actuel (${a.prixVente} €)`);
      return;
    }

    this.enchereLoading.set(true);
    this.articleService.placerEnchere(a.id, this.montantEnchere).subscribe({
      next: () => {
        this.enchereSuccess.set(true);
        this.enchereLoading.set(false);
        // Recharger article + enchères
        this.articleService.getById(a.id).subscribe((updated) => {
          this.article.set(updated);
          this.montantEnchere = updated.prixVente + 1;
        });
        this.loadEncheres(a.id);
      },
      error: (err) => {
        this.enchereError.set(err.error?.message || 'Une erreur est survenue.');
        this.enchereLoading.set(false);
      },
    });
  }

  statutClass(statut: number): string {
    const base = 'text-xs px-2.5 py-1 rounded-full font-medium';
    switch (statut) {
      case 1: return `${base} bg-green-100 text-green-700`;
      case 2: return `${base} bg-gray-100 text-gray-500`;
      default: return `${base} bg-yellow-100 text-yellow-700`;
    }
  }
}
