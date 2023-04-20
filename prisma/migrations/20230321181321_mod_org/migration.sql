/*
  Warnings:

  - You are about to drop the column `organisationId` on the `BordereauVersement` table. All the data in the column will be lost.
  - You are about to drop the column `departement` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `direction` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `ministere` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `service` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `sous_direction` on the `Organisation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nbv]` on the table `BordereauVersement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `direction` to the `BordereauVersement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `BordereauVersement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sous_direction` to the `BordereauVersement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BordereauVersement" DROP CONSTRAINT "BordereauVersement_organisationId_fkey";

-- DropIndex
DROP INDEX "BordereauVersement_nbv_organisationId_key";

-- AlterTable
ALTER TABLE "BordereauVersement" DROP COLUMN "organisationId",
ADD COLUMN     "direction" VARCHAR(255) NOT NULL,
ADD COLUMN     "service" VARCHAR(255) NOT NULL,
ADD COLUMN     "sous_direction" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "departement",
DROP COLUMN "direction",
DROP COLUMN "ministere",
DROP COLUMN "service",
DROP COLUMN "sous_direction",
ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ADD COLUMN     "logo" VARCHAR(255) NOT NULL,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "parent" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "BordereauVersement_nbv_key" ON "BordereauVersement"("nbv");
