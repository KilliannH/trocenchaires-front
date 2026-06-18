import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Adresse } from '../models/article.model';

export interface AdresseRequest {
  rue: string;
  codePostal: string;
  ville: string;
}

@Injectable({ providedIn: 'root' })
export class AdresseService {
  private api = 'http://localhost:8080/api/adresse';

  constructor(private http: HttpClient) {}

  get(): Observable<Adresse> {
    return this.http.get<Adresse>(this.api);
  }

  create(data: AdresseRequest): Observable<Adresse> {
    return this.http.post<Adresse>(this.api, data);
  }

  update(data: AdresseRequest): Observable<Adresse> {
    return this.http.put<Adresse>(this.api, data);
  }
}