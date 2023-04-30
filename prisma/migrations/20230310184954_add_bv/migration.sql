-- CreateTable
CREATE TABLE "BordereauVersement" (
    "id" SERIAL NOT NULL,
    "nbv" INTEGER NOT NULL,
    "date_versement" TIMESTAMP(3) NOT NULL,
    "direction" VARCHAR(255) NOT NULL,
    "sous_direction" VARCHAR(255) NOT NULL,
    "service" VARCHAR(255) NOT NULL,
    "intitule" VARCHAR(255) NOT NULL,
    "dateExtreme" TIMESTAMP(3) NOT NULL,
    "nbr_articles" INTEGER NOT NULL,
    "localisation" VARCHAR(255) NOT NULL,
    "metrageLineaire" INTEGER NOT NULL,
    "etatPhysique" TEXT NOT NULL,
    "nomRSVersante" VARCHAR(255) NOT NULL,
    "nomRSvPreArchivage" VARCHAR(255) NOT NULL,

    CONSTRAINT "BordereauVersement_pkey" PRIMARY KEY ("id")
);
