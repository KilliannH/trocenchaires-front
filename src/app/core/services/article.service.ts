import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ArticleAVendre,
  CreateArticleRequest,
  Enchere,
  Page,
} from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private api = 'http://localhost:8080/api/articles';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 12): Observable<Page<ArticleAVendre>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'dateDebutEncheres,desc');
    return this.http.get<Page<ArticleAVendre>>(this.api, { params });
  }

  uploadImage(articleId: number, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(
      `${this.api}/${articleId}/image`,
      formData
    );
  }

  getById(id: number): Observable<ArticleAVendre> {
    return this.http.get<ArticleAVendre>(`${this.api}/${id}`);
  }

  create(data: CreateArticleRequest): Observable<ArticleAVendre> {
    return this.http.post<ArticleAVendre>(this.api, data);
  }

  update(id: number, data: CreateArticleRequest): Observable<ArticleAVendre> {
    return this.http.put<ArticleAVendre>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getEncheres(articleId: number): Observable<Enchere[]> {
    return this.http.get<Enchere[]>(`${this.api}/${articleId}/encheres`);
  }

  placerEnchere(articleId: number, montant: number): Observable<Enchere> {
    return this.http.post<Enchere>(`${this.api}/${articleId}/encheres`, {
      montant,
    });
  }
}
