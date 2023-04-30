/*
  Warnings:

  - Added the required column `organisationId` to the `BordereauVersement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BordereauVersement" ADD COLUMN     "organisationId" INTEGER NOT NULL;
