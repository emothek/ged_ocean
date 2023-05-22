-- CreateEnum
CREATE TYPE "Container" AS ENUM ('PAPER', 'REGISTER', 'ELECTRONIC');

-- CreateTable
CREATE TABLE "ArchiveReference" (
    "id" SERIAL NOT NULL,
    "code" INTEGER,
    "documentTitle" VARCHAR(255),
    "description" VARCHAR(255),
    "container" "Container",
    "initOwner" VARCHAR(255),
    "secondOwner" VARCHAR(255),
    "duration" INTEGER,
    "durationStr" VARCHAR(255),
    "temporary" INTEGER,
    "historicalVal" BOOLEAN,
    "comments" VARCHAR(255),

    CONSTRAINT "ArchiveReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "description" VARCHAR(255),

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArchiveReference" ADD CONSTRAINT "ArchiveReference_id_fkey" FOREIGN KEY ("id") REFERENCES "Entity"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
