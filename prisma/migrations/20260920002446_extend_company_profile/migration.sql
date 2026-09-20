/*
  Warnings:

  - Added the required column `countryCode` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "registrationNumber" TEXT;
