/*
  Warnings:

  - You are about to drop the column `direction` on the `BordereauVersement` table. All the data in the column will be lost.
  - You are about to drop the column `service` on the `BordereauVersement` table. All the data in the column will be lost.
  - You are about to drop the column `sous_direction` on the `BordereauVersement` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `organisation` on the `User` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Boite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `BordereauVersement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisationId` to the `BordereauVersement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisationId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Boite" ADD COLUMN     "authorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BordereauVersement" DROP COLUMN "direction",
DROP COLUMN "service",
DROP COLUMN "sous_direction",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "organisationId" INTEGER NOT NULL,
ALTER COLUMN "date_versement" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "published",
ADD COLUMN     "authorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organisation",
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "organisationId" INTEGER NOT NULL,
ADD COLUMN     "validByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Organisation" (
    "id" SERIAL NOT NULL,
    "direction" VARCHAR(255) NOT NULL,
    "departement" VARCHAR(255) NOT NULL,
    "ministere" VARCHAR(255),
    "sous_direction" VARCHAR(255) NOT NULL,
    "service" VARCHAR(255) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FileToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FileToTag_AB_unique" ON "_FileToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_FileToTag_B_index" ON "_FileToTag"("B");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BordereauVersement" ADD CONSTRAINT "BordereauVersement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BordereauVersement" ADD CONSTRAINT "BordereauVersement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boite" ADD CONSTRAINT "Boite_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToTag" ADD CONSTRAINT "_FileToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToTag" ADD CONSTRAINT "_FileToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
