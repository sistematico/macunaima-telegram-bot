/*
  Warnings:

  - The `chatId` column on the `BannedContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `cid` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `chatId` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "BannedContent" DROP CONSTRAINT "BannedContent_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropIndex
DROP INDEX "Chat_cid_key";

-- AlterTable
ALTER TABLE "BannedContent" DROP COLUMN "chatId",
ADD COLUMN     "chatId" INTEGER;

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "cid",
ADD COLUMN     "cid" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatId",
ADD COLUMN     "chatId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedContent" ADD CONSTRAINT "BannedContent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
