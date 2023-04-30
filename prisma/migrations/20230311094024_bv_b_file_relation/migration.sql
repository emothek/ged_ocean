/*
  Warnings:

  - Added the required column `dateElimination` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateExtreme` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nArticle` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observation` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "dateElimination" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dateExtreme" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "nArticle" VARCHAR(255) NOT NULL,
ADD COLUMN     "observation" TEXT NOT NULL;
