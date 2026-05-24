import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ── Create default Admin ──────────────────────────────
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@stocksense.com' },
  })

  const adminUser = existingAdmin || await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@stocksense.com',
      password: await bcrypt.hash('Admin@123', 12),
      role: 'ADMIN',
      isActive: true,
    },
  })
  if (!existingAdmin) console.log(`✅ Admin created: ${adminUser.email}`)
  else console.log('ℹ️  Admin already exists, skipping.')

  // ── Create default Cashier ────────────────────────────
  const existingCashier = await prisma.user.findUnique({
    where: { email: 'cashier@stocksense.com' },
  })
  if (!existingCashier) {
    const cashier = await prisma.user.create({
      data: {
        name: 'Main Cashier',
        email: 'cashier@stocksense.com',
        password: await bcrypt.hash('Cashier@123', 12),
        role: 'CASHIER',
        isActive: true,
        createdById: adminUser.id
      },
    })
    console.log(`✅ Cashier created: ${cashier.email}`)
  } else {
    console.log('ℹ️  Cashier already exists, skipping.')
  }

  // ── Create default Inventory Manager ──────────────────
  const existingManager = await prisma.user.findUnique({
    where: { email: 'manager@stocksense.com' },
  })
  if (!existingManager) {
    const manager = await prisma.user.create({
      data: {
        name: 'Stock Manager',
        email: 'manager@stocksense.com',
        password: await bcrypt.hash('Manager@123', 12),
        role: 'INVENTORY_MANAGER',
        isActive: true,
        createdById: adminUser.id
      },
    })
    console.log(`✅ Inventory Manager created: ${manager.email}`)
  } else {
    console.log('ℹ️  Manager already exists, skipping.')
  }

  console.log('\n🎉 Seed complete!')
  console.log('──────────────────────────────────────')
  console.log('Login Credentials:')
  console.log('  Admin  : admin@stocksense.com   / Admin@123')
  console.log('  Cashier: cashier@stocksense.com / Cashier@123')
  console.log('  Manager: manager@stocksense.com / Manager@123')
  console.log('──────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
