import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ArticleService } from '../../core/services/article.service';
import { ArticleAVendre, Enchere } from '../../core/models/article.model';
import { StatutPipe } from '../../shared/pipes/statut.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, StatutPipe, DatePipe],
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
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private articleService = inject(ArticleService);

  mesArticles = signal<ArticleAVendre[]>([]);
  mesEncheres = signal<Enchere[]>([]);

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
    // TODO: endpoint GET /api/encheres/mes-encheres à créer côté backend
  }
}
