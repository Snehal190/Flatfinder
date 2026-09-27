-- CreateTable
CREATE TABLE "CheckedFlat" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "facts" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckedFlat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckedFlat_groupId_idx" ON "CheckedFlat"("groupId");

-- AddForeignKey
ALTER TABLE "CheckedFlat" ADD CONSTRAINT "CheckedFlat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

