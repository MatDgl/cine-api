export class CreateMovieFromTmdbDto {
  tmdbId: number; // obligatoire pour récupérer les détails
  // Champs facultatifs de contexte utilisateur
  rating?: number;
  wishlist?: boolean;
  review?: string;
  viewCount?: number;
  watched?: boolean;
  titleOverride?: string; // permet éventuellement d'écraser le titre TMDB
}
