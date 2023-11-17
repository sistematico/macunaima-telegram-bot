/*
  Warnings:

  - You are about to alter the column `chatId` on the `BannedContent` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to drop the column `isSpam` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BannedContent" DROP CONSTRAINT "BannedContent_chatId_fkey";

-- AlterTable
ALTER TABLE "BannedContent" ALTER COLUMN "chatId" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isSpam";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "BannedContent" ADD CONSTRAINT "BannedContent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
