/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbId]` on the table `Serie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "cast" TEXT,
ADD COLUMN     "director" TEXT,
ADD COLUMN     "genres" TEXT,
ADD COLUMN     "overview" TEXT,
ADD COLUMN     "releaseDate" TEXT,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "runtime" INTEGER,
ADD COLUMN     "tmdbId" INTEGER,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "watched" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Serie" ADD COLUMN     "cast" TEXT,
ADD COLUMN     "creator" TEXT,
ADD COLUMN     "episodes" INTEGER,
ADD COLUMN     "genres" TEXT,
ADD COLUMN     "overview" TEXT,
ADD COLUMN     "releaseDate" TEXT,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "runtime" INTEGER,
ADD COLUMN     "seasons" INTEGER,
ADD COLUMN     "tmdbId" INTEGER,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "watched" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "public"."Movie"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Serie_tmdbId_key" ON "public"."Serie"("tmdbId");
