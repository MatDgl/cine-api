import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

const TMDB_API_BASE = 'https://api.themoviedb.org';
const TMDB_API_VERSION = '3';

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime?: number;
  genres: { id: number; name: string }[];
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
    }>;
  };
}

export interface TmdbSerie {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  created_by?: Array<{
    id: number;
    name: string;
  }>;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}

export interface TmdbMultiRaw {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);

  /**
   * Récupère le token d'authentification TMDB depuis les variables d'environnement
   */
  private get authToken(): string {
    return process.env.TMDB_BEARER_TOKEN || '';
  }

  /**
   * Génère l'URL complète pour les images TMDB
   */
  static getImageUrl(
    path: string | null,
    size: 'w500' | 'w780' | 'original' = 'w500',
  ): string | null {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  }

  /**
   * Construit l'URL complète de l'API TMDB
   */
  private buildApiUrl(endpoint: string): URL {
    const normalizedEndpoint = endpoint.startsWith('/')
      ? `/${TMDB_API_VERSION}${endpoint}`
      : `/${TMDB_API_VERSION}/${endpoint}`;

    return new URL(normalizedEndpoint, TMDB_API_BASE);
  }

  /**
   * Effectue un appel HTTP vers l'API TMDB et retourne les données JSON
   */
  private async fetchFromTmdb<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const token = this.authToken;

    if (!token) {
      throw new UnauthorizedException(
        "TMDB_BEARER_TOKEN manquant dans les variables d'environnement",
      );
    }

    const url = this.buildApiUrl(endpoint);
    // Ajouter les paramètres de requête
    url.searchParams.set('language', 'fr-FR');
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    this.logger.log(`Appel TMDB: ${url.toString()}`);

    try {
      const response = await fetch(url, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      this.logger.log(
        `Réponse TMDB: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        this.logger.error(`Erreur TMDB ${response.status}: ${errorText}`);
        throw new InternalServerErrorException(
          `TMDB API Error: ${response.status} ${response.statusText}${
            errorText ? ` - ${errorText}` : ''
          }`,
        );
      }

      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      this.logger.error("Erreur lors de l'appel TMDB:", error);
      throw new InternalServerErrorException(
        `Erreur de communication avec l'API TMDB: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  /**
   * Recherche des films dans la base TMDB
   */
  async searchMovies(query: string): Promise<{ results: TmdbMovie[] }> {
    return await this.fetchFromTmdb('/search/movie', { query });
  }

  /**
   * Recherche des séries dans la base TMDB
   */
  async searchSeries(query: string): Promise<{ results: TmdbSerie[] }> {
    return await this.fetchFromTmdb('/search/tv', { query });
  }

  /**
   * Recherche multi (films + séries + personnes) et filtre pour ne garder que films/séries
   */
  async searchMulti(query: string): Promise<{ results: TmdbMultiRaw[] }> {
    const raw = await this.fetchFromTmdb<{ results: TmdbMultiRaw[] }>(
      '/search/multi',
      { query },
    );
    return {
      results: raw.results.filter(
        (r) => r.media_type === 'movie' || r.media_type === 'tv',
      ),
    };
  }

  /**
   * Récupère les détails complets d'un film TMDB
   */
  async getMovieDetails(tmdbId: number): Promise<TmdbMovie> {
    return await this.fetchFromTmdb(`/movie/${tmdbId}`, {
      append_to_response: 'credits',
    });
  }

  /**
   * Récupère les détails complets d'une série TMDB
   */
  async getSerieDetails(tmdbId: number): Promise<TmdbSerie> {
    return await this.fetchFromTmdb(`/tv/${tmdbId}`, {
      append_to_response: 'credits',
    });
  }
}
