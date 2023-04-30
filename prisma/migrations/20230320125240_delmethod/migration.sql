-- DropForeignKey
ALTER TABLE "Boite" DROP CONSTRAINT "Boite_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Boite" DROP CONSTRAINT "Boite_bordereauVId_fkey";

-- DropForeignKey
ALTER TABLE "BordereauVersement" DROP CONSTRAINT "BordereauVersement_authorId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_authorId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_boiteId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organisationId_fkey";

-- AlterTable
ALTER TABLE "Boite" ALTER COLUMN "bordereauVId" DROP NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BordereauVersement" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "boiteId" DROP NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "organisationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_boiteId_fkey" FOREIGN KEY ("boiteId") REFERENCES "Boite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BordereauVersement" ADD CONSTRAINT "BordereauVersement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boite" ADD CONSTRAINT "Boite_bordereauVId_fkey" FOREIGN KEY ("bordereauVId") REFERENCES "BordereauVersement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boite" ADD CONSTRAINT "Boite_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
