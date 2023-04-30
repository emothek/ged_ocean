-- CreateEnum
CREATE TYPE "Type_doc" AS ENUM ('ELECTRONIC', 'PAPIER');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "type" "Type_doc" NOT NULL DEFAULT 'ELECTRONIC';

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
