# Seed de films pour Cine-API

## Lancer le seed

Dans le dossier `cine-api/` :

```bash
npx ts-node prisma/seed.ts
```

Ou, si tu veux l'ajouter dans le package.json :

```json
"scripts": {
  ...
  "seed": "ts-node prisma/seed.ts"
}
```

Puis :

```bash
npm run seed
```

## Contenu
- 10 films variés avec tmdbId, rating, wishlist, viewCount, watched
- Les titres sont connus et compatibles avec l'intégration TMDB

Tu peux adapter ce script pour ajouter des séries ou enrichir les champs si besoin !
