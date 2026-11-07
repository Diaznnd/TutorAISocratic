-- Add PDF fields to Material
ALTER TABLE "Material" ADD COLUMN "pdfUrl"  TEXT;
ALTER TABLE "Material" ADD COLUMN "pdfName" TEXT;

-- Add link/file fields to Submission
ALTER TABLE "Submission" ADD COLUMN "linkUrl"  TEXT;
ALTER TABLE "Submission" ADD COLUMN "fileUrl"  TEXT;
ALTER TABLE "Submission" ADD COLUMN "fileName" TEXT;
