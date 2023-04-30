/*
  Warnings:

  - You are about to drop the column `textSearch` on the `File` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "File_textSearch_idx";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "textSearch";
