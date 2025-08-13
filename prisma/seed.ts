import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.movie.deleteMany(); // Clean slate

  await prisma.movie.createMany({
    data: [
      {
        title: 'Inception',
        tmdbId: 27205,
        wishlist: false,
        rating: 4.5,
        viewCount: 2,
        watched: true,
      },
      {
        title: 'Interstellar',
        tmdbId: 157336,
        wishlist: true,
        rating: 5,
        viewCount: 1,
        watched: true,
      },
      {
        title: 'The Dark Knight',
        tmdbId: 155,
        wishlist: false,
        rating: 4.8,
        viewCount: 3,
        watched: true,
      },
      {
        title: 'Pulp Fiction',
        tmdbId: 680,
        wishlist: false,
        rating: 4.7,
        viewCount: 2,
        watched: true,
      },
      {
        title: 'Fight Club',
        tmdbId: 550,
        wishlist: true,
        rating: 4.2,
        viewCount: 1,
        watched: false,
      },
      {
        title: 'Forrest Gump',
        tmdbId: 13,
        wishlist: false,
        rating: 4.9,
        viewCount: 4,
        watched: true,
      },
      {
        title: 'The Matrix',
        tmdbId: 603,
        wishlist: false,
        rating: 4.6,
        viewCount: 2,
        watched: true,
      },
      {
        title: 'The Godfather',
        tmdbId: 238,
        wishlist: true,
        rating: 5,
        viewCount: 1,
        watched: false,
      },
      {
        title: 'Gladiator',
        tmdbId: 98,
        wishlist: false,
        rating: 4.3,
        viewCount: 2,
        watched: true,
      },
      {
        title: 'La La Land',
        tmdbId: 313369,
        wishlist: true,
        rating: 4.1,
        viewCount: 1,
        watched: false,
      },
    ],
  });

  console.log('Seed terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
