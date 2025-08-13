export class CreateSerieDto {
  title: string;
  tmdbId?: number;
  rating?: number;
  wishlist?: boolean;
  review?: string;
  viewCount?: number;
  watched?: boolean;
}
