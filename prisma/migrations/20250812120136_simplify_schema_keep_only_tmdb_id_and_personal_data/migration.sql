/*
  Warnings:

  - You are about to drop the column `cast` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `director` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `runtime` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `src` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `cast` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `creator` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `episodes` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `genres` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `runtime` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `seasons` on the `Serie` table. All the data in the column will be lost.
  - You are about to drop the column `src` on the `Serie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "cast",
DROP COLUMN "director",
DROP COLUMN "genres",
DROP COLUMN "overview",
DROP COLUMN "releaseDate",
DROP COLUMN "runtime",
DROP COLUMN "src";

-- AlterTable
ALTER TABLE "public"."Serie" DROP COLUMN "cast",
DROP COLUMN "creator",
DROP COLUMN "episodes",
DROP COLUMN "genres",
DROP COLUMN "overview",
DROP COLUMN "releaseDate",
DROP COLUMN "runtime",
DROP COLUMN "seasons",
DROP COLUMN "src";
