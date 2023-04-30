/*
  Warnings:

  - Added the required column `boiteId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "boiteId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_boiteId_fkey" FOREIGN KEY ("boiteId") REFERENCES "Boite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
