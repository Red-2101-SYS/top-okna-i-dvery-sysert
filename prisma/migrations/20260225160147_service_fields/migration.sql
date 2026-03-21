-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "body" TEXT,
ADD COLUMN     "imgUrl" TEXT,
ADD COLUMN     "short" TEXT,
ADD COLUMN     "sort" INTEGER NOT NULL DEFAULT 100;
