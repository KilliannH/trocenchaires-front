import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/articles/article-list/article-list.component').then(
        (m) => m.ArticleListComponent
      ),
  },
  {
    path: 'articles/creer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/articles/article-create/article-create.component').then(
        (m) => m.ArticleCreateComponent
      ),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./features/articles/article-detail/article-detail.component').then(
        (m) => m.ArticleDetailComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then(
        (m) => m.OnboardingComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
