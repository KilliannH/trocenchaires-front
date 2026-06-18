import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleAVendre } from '../../../core/models/article.model';
import { StatutPipe } from '../../pipes/statut.pipe';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink, StatutPipe, DatePipe],
  template: `
    <a
      [routerLink]="['/articles', article.id]"
      class="group block bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden">

      <!-- Placeholder image -->
      <div class="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
        @if (article.imageUrl) {
          <img [src]="article.imageUrl" [alt]="article.nom"
              class="w-full h-full object-cover" />
        } @else {
          <span class="text-4xl">📦</span>
        }
      </div>


      <div class="p-4">
        <!-- Catégorie + statut -->
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-indigo-500 font-medium uppercase tracking-wide">
            {{ article.categorie?.libelle || 'Sans catégorie' }}
          </span>
          <span [class]="statutClass()">
            {{ article.statut | statut }}
          </span>
        </div>

        <!-- Nom -->
        <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3">
          {{ article.nom }}
        </h3>

        <!-- Prix et dates -->
        <div class="flex items-end justify-between">
          <div>
            <p class="text-xs text-gray-400">Prix actuel</p>
            <p class="text-lg font-bold text-indigo-600">{{ article.prixVente }} €</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-400">Fin le</p>
            <p class="text-xs font-medium text-gray-600">
              {{ article.dateFinEncheres | date:'dd/MM/yyyy' }}
            </p>
          </div>
        </div>

        <!-- Vendeur -->
        <p class="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2">
          Par <span class="font-medium text-gray-600">{{ article.vendeur?.pseudo }}</span>
        </p>
      </div>
    </a>
  `,
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: ArticleAVendre;

  statutClass(): string {
    const base = 'text-xs px-2 py-0.5 rounded-full font-medium';
    switch (this.article.statut) {
      case 1: return `${base} bg-green-100 text-green-700`;
      case 2: return `${base} bg-gray-100 text-gray-500`;
      default: return `${base} bg-yellow-100 text-yellow-700`;
    }
  }
}
