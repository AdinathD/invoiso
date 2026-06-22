-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hsn" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "gstPercent" DECIMAL(5,2) NOT NULL,
    "stock" DECIMAL(12,3) NOT NULL,
    "uom" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaultWeight" DECIMAL(12,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
