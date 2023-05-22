-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
