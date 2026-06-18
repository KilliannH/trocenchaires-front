import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { Categorie } from '../../../core/models/article.model';

@Component({
  selector: 'app-article-create',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      <a routerLink="/" class="text-sm text-indigo-600 hover:underline flex items-center gap-1 mb-6">
        ← Retour aux enchères
      </a>

      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mettre un article en vente</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

        <!-- Nom -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'article *</label>
          <input
            formControlName="nom"
            type="text"
            placeholder="Ex : Vélo de course Decathlon"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          @if (hasError('nom', 'required')) {
            <p class="text-xs text-red-500 mt-1">Le nom est requis</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            formControlName="description"
            rows="4"
            placeholder="Décrivez votre article (état, marque, dimensions...)"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none">
          </textarea>
        </div>

        <!-- Upload image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Photo de l'article</label>
          <input
            type="file"
            accept="image/*"
            (change)="onFileSelected($event)"
            class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0 file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
          @if (selectedFile) {
            <p class="text-xs text-gray-400 mt-1">{{ selectedFile.name }}</p>
          }
        </div>

        <!-- Catégorie -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
          <select
            formControlName="categorieId"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
            <option value="">Sélectionner une catégorie</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.libelle }}</option>
            }
          </select>
          @if (hasError('categorieId', 'required')) {
            <p class="text-xs text-red-500 mt-1">La catégorie est requise</p>
          }
        </div>

        <!-- Prix initial -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prix de départ (€) *</label>
          <input
            formControlName="prixInitial"
            type="number"
            min="1"
            placeholder="1"
            class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          @if (hasError('prixInitial', 'min')) {
            <p class="text-xs text-red-500 mt-1">Le prix doit être supérieur à 0</p>
          }
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Début des enchères *</label>
            <input
              formControlName="dateDebutEncheres"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fin des enchères *</label>
            <input
              formControlName="dateFinEncheres"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
        </div>
        @if (form.errors?.['datesInvalides'] && form.touched) {
          <p class="text-xs text-red-500 -mt-3">La date de fin doit être après la date de début</p>
        }

        <!-- Erreur globale -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ error() }}
          </div>
        }

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            [disabled]="loading() || form.invalid"
            class="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm
                   hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            @if (loading()) { Publication en cours... } @else { Publier l'article }
          </button>
          <a routerLink="/"
             class="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium
                    text-gray-700 hover:bg-gray-50 transition-colors">
            Annuler
          </a>
        </div>
      </form>
    </div>
  `,
})
export class ArticleCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private articleService = inject(ArticleService);
  private categorieService = inject(CategorieService);
  private router = inject(Router);
  selectedFile: File | null = null;

  categories = signal<Categorie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group(
    {
      nom: ['', Validators.required],
      description: [''],
      categorieId: ['', Validators.required],
      prixInitial: [1, [Validators.required, Validators.min(1)]],
      dateDebutEncheres: [this.today(), Validators.required],
      dateFinEncheres: [this.inOneWeek(), Validators.required]
    },
    { validators: this.datesValidator }
  );

  ngOnInit() {
    this.categorieService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  datesValidator(group: any) {
    const debut = group.get('dateDebutEncheres')?.value;
    const fin = group.get('dateFinEncheres')?.value;
    if (debut && fin && fin <= debut) {
      return { datesInvalides: true };
    }
    return null;
  }

  hasError(field: string, errorType: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(errorType) && ctrl?.touched);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const v = this.form.value;

    // On crée l'adresse côté backend via un endpoint dédié ou on l'envoie inline.
    // Ici on utilise adresseRetraitId = 1 comme fallback temporaire,
    // à remplacer quand le CategorieController + AdresseController seront créés.
    const payload = {
      nom: v.nom!,
      description: v.description || '',
      dateDebutEncheres: v.dateDebutEncheres!,
      dateFinEncheres: v.dateFinEncheres!,
      prixInitial: v.prixInitial!,
      categorieId: Number(v.categorieId)
    };

    this.articleService.create(payload).subscribe({
      next: (article) => {
        if (this.selectedFile) {
          this.articleService.uploadImage(article.id, this.selectedFile).subscribe({
            next: () => this.router.navigate(['/articles', article.id]),
            error: () => this.router.navigate(['/articles', article.id]), // on navigue quand même
          });
        } else {
          this.router.navigate(['/articles', article.id]);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la publication.');
        this.loading.set(false);
      },
    });
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private inOneWeek(): string {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }
}
