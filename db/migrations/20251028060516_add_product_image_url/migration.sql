/*
  Warnings:

  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "public"."Unit";
