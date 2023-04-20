-- CreateTable
CREATE TABLE "Boite" (
    "id" SERIAL NOT NULL,
    "nbBoite" INTEGER NOT NULL,
    "nbSalle" INTEGER NOT NULL,
    "nbRayonnage" INTEGER NOT NULL,
    "nbEtage" INTEGER NOT NULL,

    CONSTRAINT "Boite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Boite_nbBoite_key" ON "Boite"("nbBoite");

-- CreateIndex
CREATE UNIQUE INDEX "Boite_nbSalle_key" ON "Boite"("nbSalle");

-- CreateIndex
CREATE UNIQUE INDEX "Boite_nbRayonnage_key" ON "Boite"("nbRayonnage");

-- CreateIndex
CREATE UNIQUE INDEX "Boite_nbEtage_key" ON "Boite"("nbEtage");
