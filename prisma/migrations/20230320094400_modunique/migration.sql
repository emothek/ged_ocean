/*
  Warnings:

  - A unique constraint covering the columns `[nbBoite,bordereauVId]` on the table `Boite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nbv,organisationId]` on the table `BordereauVersement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Boite_nbBoite_key";

-- DropIndex
DROP INDEX "BordereauVersement_nbv_key";

-- CreateIndex
CREATE UNIQUE INDEX "Boite_nbBoite_bordereauVId_key" ON "Boite"("nbBoite", "bordereauVId");

-- CreateIndex
CREATE UNIQUE INDEX "BordereauVersement_nbv_organisationId_key" ON "BordereauVersement"("nbv", "organisationId");
