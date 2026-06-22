import 'dotenv/config'

import { PrismaClient } from '../src/generated/prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'loaded' : 'missing')

  const jsonPath = path.join(__dirname, 'products.json')
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  await prisma.product.deleteMany({})

  await prisma.product.createMany({
    data: products.map((p: any) => ({
      name: p.name,
      hsn: p.hsn,
      price: p.price,
      gstPercent: p.gstPercent,
      stock: p.stock,
      uom: p.uom,
      category: p.category,
      defaultWeight: p.defaultWeight || null,
    })),
  })

  console.log('Seeded products successfully!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })