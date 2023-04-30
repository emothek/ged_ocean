-- AlterTable
ALTER TABLE "File" ADD COLUMN     "textSearch" tsvector DEFAULT ''::tsvector;

-- AlterTable
ALTER TABLE "Organisation" ALTER COLUMN "logo" DROP NOT NULL;
