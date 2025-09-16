-- Add clientId column with a temporary default for backfill
ALTER TABLE "public"."Like" ADD COLUMN "clientId" TEXT NOT NULL DEFAULT '';

-- Backfill existing rows to use ip as initial clientId
UPDATE "public"."Like" SET "clientId" = "ip" WHERE "clientId" = '' OR "clientId" IS NULL;

-- Drop old unique index on (ip, paletteId)
DROP INDEX IF EXISTS "public"."Like_ip_paletteId_key";

-- Create new unique index on (clientId, paletteId)
CREATE UNIQUE INDEX "Like_clientId_paletteId_key" ON "public"."Like"("clientId", "paletteId");

-- Remove the default now that data is backfilled
ALTER TABLE "public"."Like" ALTER COLUMN "clientId" DROP DEFAULT;
