/*
  Warnings:

  - A unique constraint covering the columns `[cid]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BannedContent" DROP CONSTRAINT "BannedContent_chatId_fkey";

-- AlterTable
ALTER TABLE "BannedContent" ALTER COLUMN "chatId" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_cid_key" ON "Chat"("cid");

-- AddForeignKey
ALTER TABLE "BannedContent" ADD CONSTRAINT "BannedContent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("cid") ON DELETE SET NULL ON UPDATE CASCADE;
