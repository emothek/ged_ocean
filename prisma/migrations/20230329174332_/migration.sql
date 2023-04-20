-- CreateIndex
CREATE INDEX "File_textSearch_idx" ON "File" USING GIN ("textSearch");
