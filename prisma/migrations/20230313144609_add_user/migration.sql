/*
  Warnings:

  - A unique constraint covering the columns `[nbv]` on the table `BordereauVersement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nArticle]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Boite_nbEtage_key";

-- DropIndex
DROP INDEX "Boite_nbRayonnage_key";

-- DropIndex
DROP INDEX "Boite_nbSalle_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "verified" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "BordereauVersement_nbv_key" ON "BordereauVersement"("nbv");

-- CreateIndex
CREATE UNIQUE INDEX "File_nArticle_key" ON "File"("nArticle");
