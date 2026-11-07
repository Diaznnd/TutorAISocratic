-- CreateTable Assignment
CREATE TABLE "Assignment" (
    "id"          SERIAL PRIMARY KEY,
    "classId"     INTEGER NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "dueDate"     TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable Submission
CREATE TABLE "Submission" (
    "id"           SERIAL PRIMARY KEY,
    "assignmentId" INTEGER NOT NULL,
    "userId"       INTEGER NOT NULL,
    "content"      TEXT NOT NULL DEFAULT '',
    "grade"        INTEGER,
    "feedback"     TEXT,
    "submittedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt"     TIMESTAMP(3),
    CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex unique per mahasiswa per assignment
CREATE UNIQUE INDEX "Submission_assignmentId_userId_key" ON "Submission"("assignmentId", "userId");

-- CreateTable SharedMaterial
CREATE TABLE "SharedMaterial" (
    "id"        SERIAL PRIMARY KEY,
    "classId"   INTEGER NOT NULL,
    "title"     TEXT NOT NULL,
    "fileUrl"   TEXT NOT NULL,
    "fileName"  TEXT NOT NULL,
    "fileType"  TEXT NOT NULL DEFAULT 'application/pdf',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SharedMaterial_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
