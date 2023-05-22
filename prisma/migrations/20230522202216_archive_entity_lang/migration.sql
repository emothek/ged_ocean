-- CreateEnum
CREATE TYPE "Language" AS ENUM ('AR', 'FR', 'EN');

-- AlterTable
ALTER TABLE "ArchiveReference" ADD COLUMN     "language" "Language";

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "language" "Language";
