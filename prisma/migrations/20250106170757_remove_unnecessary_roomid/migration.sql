/*
  Warnings:

  - You are about to drop the column `roomId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_roomId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roomId";
