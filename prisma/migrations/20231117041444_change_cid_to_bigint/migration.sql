/*
  Warnings:

  - You are about to alter the column `chatId` on the `BannedContent` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "BannedContent" DROP CONSTRAINT "BannedContent_chatId_fkey";

-- AlterTable
ALTER TABLE "BannedContent" ALTER COLUMN "chatId" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "BannedContent" ADD CONSTRAINT "BannedContent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
