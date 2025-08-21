export class CreateSerieFromTmdbDto {
  tmdbId: number;
  rating?: number;
  wishlist?: boolean;
  review?: string;
  viewCount?: number;
  watched?: boolean;
  titleOverride?: string;
}
