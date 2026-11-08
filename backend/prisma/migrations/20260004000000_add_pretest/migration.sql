-- CreateTable
CREATE TABLE "PreTest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "materialId" INTEGER,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "score" DOUBLE PRECISION,
    "totalQA" INTEGER NOT NULL DEFAULT 0,
    "correctQA" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PreTest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PreTest" ADD CONSTRAINT "PreTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
