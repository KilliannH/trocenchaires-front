export interface Utilisateur {
  pseudo: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  credit: number;
  admin: boolean;
}

export interface Categorie {
  id: number;
  libelle: string;
}

export interface Adresse {
  id: number;
  rue: string;
  codePostal: string;
  ville: string;
}

export interface ArticleAVendre {
  id: number;
  nom: string;
  description: string;
  dateDebutEncheres: string;
  dateFinEncheres: string;
  prixInitial: number;
  imageUrl?: string;
  prixVente: number;
  statut: number;
  vendeur: Utilisateur;
  categorie: Categorie;
  retrait: Adresse;
  encheres?: Enchere[];
}

export interface Enchere {
  id: number;
  date: string;
  montant: number;
  acquereur: Utilisateur;
  articleAVendre?: { id: number; nom: string };
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CreateArticleRequest {
  nom: string;
  description: string;
  dateDebutEncheres: string;
  dateFinEncheres: string;
  prixInitial: number;
  categorieId: number;
}

export interface LoginRequest {
  pseudo: string;
  motDePasse: string;
}

export interface RegisterRequest {
  pseudo: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
}
