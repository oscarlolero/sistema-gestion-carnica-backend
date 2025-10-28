/*
  Warnings:

  - You are about to drop the column `baseUnitId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_baseUnitId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "baseUnitId";
