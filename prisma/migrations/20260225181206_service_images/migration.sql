/*
  Warnings:

  - You are about to drop the column `body` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `imgUrl` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `short` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "body",
DROP COLUMN "imgUrl",
DROP COLUMN "short",
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
