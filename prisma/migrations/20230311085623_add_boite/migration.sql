/*
  Warnings:

  - You are about to drop the `Categorie` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bordereauVId]` on the table `Boite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bordereauVId` to the `Boite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Boite" ADD COLUMN     "bordereauVId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Categorie";

-- CreateIndex
CREATE UNIQUE INDEX "Boite_bordereauVId_key" ON "Boite"("bordereauVId");

-- AddForeignKey
ALTER TABLE "Boite" ADD CONSTRAINT "Boite_bordereauVId_fkey" FOREIGN KEY ("bordereauVId") REFERENCES "BordereauVersement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
