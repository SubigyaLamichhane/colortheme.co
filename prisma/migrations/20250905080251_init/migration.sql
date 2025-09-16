-- CreateTable
CREATE TABLE "public"."Palette" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Palette_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "paletteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Palette_slug_key" ON "public"."Palette"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Like_ip_paletteId_key" ON "public"."Like"("ip", "paletteId");

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "public"."Palette"("id") ON DELETE CASCADE ON UPDATE CASCADE;
