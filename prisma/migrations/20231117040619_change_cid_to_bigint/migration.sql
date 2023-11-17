-- DropForeignKey
ALTER TABLE "BannedContent" DROP CONSTRAINT "BannedContent_chatId_fkey";

-- AlterTable
ALTER TABLE "BannedContent" ALTER COLUMN "chatId" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "BannedContent" ADD CONSTRAINT "BannedContent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("cid") ON DELETE SET NULL ON UPDATE CASCADE;
