-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activity" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "payload" JSONB,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
