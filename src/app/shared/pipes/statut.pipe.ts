import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statut' })
export class StatutPipe implements PipeTransform {
  transform(statut: number): string {
    switch (statut) {
      case 0: return 'En attente';
      case 1: return 'En cours';
      case 2: return 'Terminée';
      case 3: return 'Annulée';
      default: return 'Inconnu';
    }
  }
}
