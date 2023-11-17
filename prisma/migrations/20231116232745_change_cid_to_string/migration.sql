/*
  Warnings:

  - Made the column `chatId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "BannedContent" DROP CONSTRAINT "BannedContent_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- AlterTable
ALTER TABLE "BannedContent" ALTER COLUMN "chatId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "chatId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedContent" ADD CONSTRAINT "BannedContent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("cid") ON DELETE SET NULL ON UPDATE CASCADE;
