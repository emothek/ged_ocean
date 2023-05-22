/*
  Warnings:

  - A unique constraint covering the columns `[archiveReferenceId]` on the table `ArchiveReference` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `archiveReferenceId` to the `ArchiveReference` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ArchiveReference" DROP CONSTRAINT "ArchiveReference_id_fkey";

-- AlterTable
ALTER TABLE "ArchiveReference" ADD COLUMN     "archiveReferenceId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveReference_archiveReferenceId_key" ON "ArchiveReference"("archiveReferenceId");

-- AddForeignKey
ALTER TABLE "ArchiveReference" ADD CONSTRAINT "ArchiveReference_archiveReferenceId_fkey" FOREIGN KEY ("archiveReferenceId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
