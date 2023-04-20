/*
  Warnings:

  - A unique constraint covering the columns `[nbBoite,nbSalle]` on the table `Boite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[boiteId,nArticle]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Boite_nbBoite_bordereauVId_key";

-- DropIndex
DROP INDEX "File_nArticle_key";

-- CreateIndex
CREATE UNIQUE INDEX "Boite_nbBoite_nbSalle_key" ON "Boite"("nbBoite", "nbSalle");

-- CreateIndex
CREATE UNIQUE INDEX "File_boiteId_nArticle_key" ON "File"("boiteId", "nArticle");
