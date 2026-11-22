/*
  Warnings:

  - You are about to drop the column `token` on the `Invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Invitation_token_key";

-- DropIndex
DROP INDEX "Notification_recipientId_createdAt_idx";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "token",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "companyId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_id_idx" ON "Notification"("recipientId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Notification_recipientId_companyId_createdAt_idx" ON "Notification"("recipientId", "companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
