-- DropForeignKey
ALTER TABLE "BordereauVersement" DROP CONSTRAINT "BordereauVersement_organisationId_fkey";

-- AlterTable
ALTER TABLE "BordereauVersement" ALTER COLUMN "organisationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BordereauVersement" ADD CONSTRAINT "BordereauVersement_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
