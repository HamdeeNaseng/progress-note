-- AlterTable: add nullable projectId column to Note
ALTER TABLE "Note" ADD COLUMN "projectId" TEXT;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Note_projectId_idx" ON "Note"("projectId");
