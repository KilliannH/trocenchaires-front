import { Component, OnInit, inject, signal } from '@angular/core';
import { ArticleService } from '../../../core/services/article.service';
import { ArticleAVendre, Page } from '../../../core/models/article.model';
import { ArticleCardComponent } from '../../../shared/components/article-card/article-card.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-article-list',
  imports: [ArticleCardComponent, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Enchères en cours</h1>
          <p class="text-gray-500 mt-1">{{ page()?.totalElements ?? 0 }} article(s) disponible(s)</p>
        </div>
        @if (auth.isLoggedIn()) {
          <a routerLink="/articles/creer"
             class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
            + Mettre en vente
          </a>
        }
      </div>

      <!-- Chargement -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div class="h-40 bg-gray-100"></div>
              <div class="p-4 space-y-3">
                <div class="h-3 bg-gray-100 rounded w-1/3"></div>
                <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                <div class="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Erreur -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error() }}
        </div>
      }

      <!-- Liste -->
      @if (!loading() && !error()) {
        @if (articles().length === 0) {
          <div class="text-center py-20 text-gray-400">
            <p class="text-5xl mb-4">🏷️</p>
            <p class="text-lg font-medium text-gray-500">Aucune enchère pour le moment</p>
            @if (auth.isLoggedIn()) {
              <a routerLink="/articles/creer"
                 class="mt-4 inline-block text-indigo-600 hover:underline">
                Soyez le premier à mettre un article en vente
              </a>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (article of articles(); track article.id) {
              <app-article-card [article]="article" />
            }
          </div>

          <!-- Pagination -->
          @if ((page()?.totalPages ?? 0) > 1) {
            <div class="flex justify-center items-center gap-2 mt-10">
              <button
                (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() === 0"
                class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600
                       hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ← Précédent
              </button>

              @for (p of pageNumbers(); track p) {
                <button
                  (click)="goToPage(p)"
                  [class]="p === currentPage()
                    ? 'px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium'
                    : 'px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors'">
                  {{ p + 1 }}
                </button>
              }

              <button
                (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() >= (page()?.totalPages ?? 1) - 1"
                class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600
                       hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Suivant →
              </button>
            </div>
          }
        }
      }
    </div>
  `,
})
export class ArticleListComponent implements OnInit {
  private articleService = inject(ArticleService);
  auth = inject(AuthService);

  articles = signal<ArticleAVendre[]>([]);
  page = signal<Page<ArticleAVendre> | null>(null);
  currentPage = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.articleService.getAll(this.currentPage()).subscribe({
      next: (p) => {
        this.page.set(p);
        this.articles.set(p.content);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les enchères. Vérifiez que le backend est démarré.');
        this.loading.set(false);
      },
    });
  }

  goToPage(p: number) {
    this.currentPage.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pageNumbers(): number[] {
    const total = this.page()?.totalPages ?? 0;
    return Array.from({ length: Math.min(total, 7) }, (_, i) => i);
  }
}
