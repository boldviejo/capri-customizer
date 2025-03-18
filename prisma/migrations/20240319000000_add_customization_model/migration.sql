-- CreateTable
CREATE TABLE "Customization" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shop" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "fontSize" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,

    CONSTRAINT "Customization_pkey" PRIMARY KEY ("id")
); 