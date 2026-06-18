import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <a routerLink="/" class="text-xl font-bold text-indigo-600 tracking-tight">
          🏷️ TrocEnchères
        </a>

        <div class="flex items-center gap-6 text-sm font-medium">
          <a routerLink="/"
             routerLinkActive="text-indigo-600"
             [routerLinkActiveOptions]="{ exact: true }"
             class="text-gray-600 hover:text-indigo-600 transition-colors">
            Enchères
          </a>

          @if (auth.isLoggedIn()) {
            <a routerLink="/articles/creer"
               class="text-gray-600 hover:text-indigo-600 transition-colors">
              Vendre
            </a>
            <a routerLink="/profil"
               routerLinkActive="text-indigo-600"
               class="text-gray-600 hover:text-indigo-600 transition-colors">
              Mon profil
            </a>
            <span class="text-gray-400">|</span>
            <span class="text-gray-500">{{ auth.getPseudo() }}</span>
            <button
              (click)="auth.logout()"
              class="text-red-500 hover:text-red-700 transition-colors">
              Déconnexion
            </button>
          } @else {
            <a routerLink="/login"
               class="text-gray-600 hover:text-indigo-600 transition-colors">
              Connexion
            </a>
            <a routerLink="/register"
               class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              S'inscrire
            </a>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);
}
