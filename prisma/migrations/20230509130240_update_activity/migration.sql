/*
  Warnings:

  - Added the required column `organisationId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "fileId" INTEGER,
ADD COLUMN     "organisationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
