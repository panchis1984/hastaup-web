-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "details" DROP NOT NULL;
