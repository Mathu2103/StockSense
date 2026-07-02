import 'dotenv/config';
import {
  PrismaClient, BrandState, ProductStatus, Role, PaymentMethod,
  NotificationType, NotificationSeverity, AdjustmentReason
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

let barcodeSeq = 479100000000;
function genBarcode(): string {
  barcodeSeq++;
  const b = barcodeSeq.toString();
  let s = 0;
  for (let i = 0; i < 12; i++) s += parseInt(b[i]) * (i % 2 === 0 ? 1 : 3);
  return `${b}${(10 - (s % 10)) % 10}`;
}

function makeSku(brand: string, prod: string, size: string, seq: number): string {
  const br = brand.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const pr = prod.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const sz = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${br}-${pr}-${sz}-${seq.toString().padStart(4, '0')}`;
}

function varMult(v: string): number {
  if (v.includes('50Kg')) return 50;
  if (v.includes('25Kg')) return 25;
  if (v.includes('10Kg')) return 10;
  if (v.includes('5Kg')) return 5;
  if (v.includes('2Kg') || v.includes('2L')) return 2;
  if (v.includes('1Kg') || v.includes('1L') || v.includes('1pcs')) return 1;
  if (v.includes('500g') || v.includes('500ml')) return 0.5;
  if (v.includes('400g') || v.includes('330g') || v.includes('330ml')) return 0.4;
  if (v.includes('250g') || v.includes('250ml')) return 0.25;
  if (v.includes('200g') || v.includes('200ml')) return 0.2;
  if (v.includes('190g')) return 0.19;
  if (v.includes('170ml')) return 0.17;
  if (v.includes('160g')) return 0.16;
  if (v.includes('120g') || v.includes('100g') || v.includes('100ml')) return 0.1;
  if (v.includes('50g')) return 0.05;
  if (v.includes('x 4') || v.includes('5pcs')) return 4;
  return 1;
}

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
const addD = (d: Date, n: number) => { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r; };
const dKey = (d: Date) => d.toISOString().split('T')[0];
const rTime = (d: Date) => { const r = new Date(d); r.setUTCHours(ri(7, 20), ri(0, 59), ri(0, 59), 0); return r; };

// Festival days
const festDays = new Set([
  '2025-01-14', '2025-01-15', '2025-01-16',  // Thai Pongal
  '2025-02-04',                                // Independence Day
  '2025-02-14',                                // Valentine's Day
  '2025-03-29', '2025-03-30',                  // Ramadan Eid
  '2025-04-13', '2025-04-14',                  // Sinhala/Tamil New Year
  '2025-05-01',                                // May Day
  '2025-05-12', '2025-05-13',                  // Vesak
  '2025-06-12', '2025-06-13',                  // Poson
]);
const isFest = (d: Date) => festDays.has(dKey(d));
const isWE = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6;
const dayBillCount = (d: Date) => isFest(d) ? ri(12, 16) : isWE(d) ? ri(7, 10) : ri(4, 7);

// Sequential ID generators
let billN = 0, grnN = 0, refN = 0;
const nxtBill = () => `INV-2025-${(++billN).toString().padStart(4, '0')}`;
const nxtGrn = () => `GRN-2025-${(++grnN).toString().padStart(4, '0')}`;
const nxtRef = () => `REF-2025-${(++refN).toString().padStart(4, '0')}`;

// ═══════════════════════════════════════════════════════════════
// DATA DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const suppliersRaw = [
  { name: 'Mannar Sea Foods', email: 'contact@mannarsea.lk', phone: '0772223456', address: 'Main Street, Mannar' },
  { name: 'Pesalai Traders', email: 'sales@pesalaitraders.lk', phone: '0712221122', address: 'Pesalai, Mannar' },
  { name: 'Murunkan Mills', email: 'info@murunkanmills.com', phone: '0772223344', address: 'Murunkan, Mannar' },
  { name: 'Thalaimannar Distributors', email: 'supply@thalaimannar.lk', phone: '0762225566', address: 'Thalaimannar' },
  { name: 'Nanaddan Grocers', email: 'nanaddan@gmail.com', phone: '0702227788', address: 'Nanaddan, Mannar' },
  { name: 'Silavathurai Traders', email: 'silavathurai@yahoo.com', phone: '0782229900', address: 'Silavathurai, Mannar' },
  { name: 'Vankalai Wholesale', email: 'vankalai@mannar.lk', phone: '0712222233', address: 'Vankalai, Mannar' },
  { name: 'Mannar Hub Logistics', email: 'hub@mannarlogistics.com', phone: '0752224455', address: 'Moor Street, Mannar' },
  { name: 'Illuppaikkadavai Supply', email: 'illuppai@gmail.com', phone: '0722226677', address: 'Illuppaikkadavai' },
  { name: 'Adampan Distributors', email: 'adampan@traders.com', phone: '0772228899', address: 'Adampan, Mannar' },
];

const categoriesRaw = [
  { name: 'Seafood & Dry Fish', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=800&auto=format&fit=crop', subs: ['Fresh Fish', 'Dry Fish (Karuvadu)', 'Prawns', 'Crab'] },
  { name: 'Groceries & Staples', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop', subs: ['Rice', 'Flour & Sugar', 'Spices & Condiments', 'Pulses'] },
  { name: 'Beverages', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&auto=format&fit=crop', subs: ['Tea & Coffee', 'Soft Drinks', 'Fruit Juices'] },
  { name: 'Snacks & Bakery', image: 'https://images.unsplash.com/photo-1599599810765-bfb1a31656d5?q=80&w=800&auto=format&fit=crop', subs: ['Biscuits', 'Cakes & Buns', 'Sweets & Chocolates'] },
  { name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop', subs: ['Soaps & Body Wash', 'Hair Care', 'Oral Care', 'Skin Care'] },
];

const brandsRaw = ['Mannar Best', 'Pesalai Catch', 'Ceylon Gold', 'Munchee', 'Maliban', 'Sunlight', 'Lifebuoy', 'Nescafe', 'Dilmah', 'Kist'];

const baseProducts = [
  // Seafood & Dry Fish
  { name: 'Seer Fish (Thora)', cat: 'Seafood & Dry Fish', sub: 'Fresh Fish', brand: 'Pesalai Catch', sup: 'Pesalai Traders', price: 1800, cost: 1500, vars: ['500g', '1Kg'], weight: 2 },
  { name: 'Katta Karuvadu', cat: 'Seafood & Dry Fish', sub: 'Dry Fish (Karuvadu)', brand: 'Mannar Best', sup: 'Mannar Sea Foods', price: 2200, cost: 1800, vars: ['250g', '500g', '1Kg'], weight: 2 },
  { name: 'Sprats (Keeramin)', cat: 'Seafood & Dry Fish', sub: 'Dry Fish (Karuvadu)', brand: 'Pesalai Catch', sup: 'Pesalai Traders', price: 1100, cost: 900, vars: ['250g', '500g', '1Kg'], weight: 2 },
  { name: 'Tiger Prawns', cat: 'Seafood & Dry Fish', sub: 'Prawns', brand: 'Mannar Best', sup: 'Silavathurai Traders', price: 2500, cost: 2100, vars: ['500g', '1Kg'], weight: 1 },
  { name: 'Mud Crab', cat: 'Seafood & Dry Fish', sub: 'Crab', brand: 'Mannar Best', sup: 'Vankalai Wholesale', price: 1500, cost: 1200, vars: ['1Kg', '2Kg'], weight: 1 },
  { name: 'Kumbalava Dry Fish', cat: 'Seafood & Dry Fish', sub: 'Dry Fish (Karuvadu)', brand: 'Mannar Best', sup: 'Illuppaikkadavai Supply', price: 900, cost: 750, vars: ['500g', '1Kg'], weight: 1 },
  // Groceries & Staples
  { name: 'Keeri Samba Rice', cat: 'Groceries & Staples', sub: 'Rice', brand: 'Ceylon Gold', sup: 'Murunkan Mills', price: 350, cost: 300, vars: ['1Kg', '2Kg', '5Kg', '10Kg', '25Kg', '50Kg'], weight: 3 },
  { name: 'Nadu Rice', cat: 'Groceries & Staples', sub: 'Rice', brand: 'Ceylon Gold', sup: 'Murunkan Mills', price: 220, cost: 190, vars: ['1Kg', '2Kg', '5Kg', '10Kg', '25Kg', '50Kg'], weight: 3 },
  { name: 'Wheat Flour', cat: 'Groceries & Staples', sub: 'Flour & Sugar', brand: 'Mannar Best', sup: 'Nanaddan Grocers', price: 210, cost: 180, vars: ['500g', '1Kg', '2Kg', '5Kg', '10Kg'], weight: 3 },
  { name: 'White Sugar', cat: 'Groceries & Staples', sub: 'Flour & Sugar', brand: 'Mannar Best', sup: 'Thalaimannar Distributors', price: 320, cost: 280, vars: ['500g', '1Kg', '2Kg', '5Kg'], weight: 3 },
  { name: 'Chilli Powder', cat: 'Groceries & Staples', sub: 'Spices & Condiments', brand: 'Ceylon Gold', sup: 'Mannar Hub Logistics', price: 1500, cost: 1200, vars: ['50g', '100g', '250g', '500g', '1Kg'], weight: 3 },
  { name: 'Turmeric Powder', cat: 'Groceries & Staples', sub: 'Spices & Condiments', brand: 'Ceylon Gold', sup: 'Adampan Distributors', price: 1600, cost: 1300, vars: ['50g', '100g', '250g', '500g', '1Kg'], weight: 2 },
  { name: 'Mysore Dhal', cat: 'Groceries & Staples', sub: 'Pulses', brand: 'Mannar Best', sup: 'Nanaddan Grocers', price: 400, cost: 340, vars: ['250g', '500g', '1Kg', '2Kg', '5Kg', '10Kg'], weight: 2 },
  // Beverages
  { name: 'Premium Tea Dust', cat: 'Beverages', sub: 'Tea & Coffee', brand: 'Dilmah', sup: 'Mannar Hub Logistics', price: 250, cost: 200, vars: ['100g', '200g', '500g', '1Kg'], weight: 3 },
  { name: 'Nescafe Classic', cat: 'Beverages', sub: 'Tea & Coffee', brand: 'Nescafe', sup: 'Thalaimannar Distributors', price: 1450, cost: 1200, vars: ['50g', '100g', '200g'], weight: 2 },
  { name: 'Ceylon Golden Tea', cat: 'Beverages', sub: 'Tea & Coffee', brand: 'Ceylon Gold', sup: 'Mannar Hub Logistics', price: 300, cost: 240, vars: ['100g', '200g', '400g'], weight: 1 },
  { name: 'Kist Orange Nectar', cat: 'Beverages', sub: 'Fruit Juices', brand: 'Kist', sup: 'Vankalai Wholesale', price: 850, cost: 700, vars: ['1L', '2L'], weight: 1 },
  { name: 'Mixed Fruit Juice', cat: 'Beverages', sub: 'Fruit Juices', brand: 'Kist', sup: 'Adampan Distributors', price: 900, cost: 750, vars: ['1L'], weight: 1 },
  // Snacks & Bakery
  { name: 'Lemon Puff', cat: 'Snacks & Bakery', sub: 'Biscuits', brand: 'Munchee', sup: 'Nanaddan Grocers', price: 150, cost: 120, vars: ['100g', '200g', '400g'], weight: 2 },
  { name: 'Cream Cracker', cat: 'Snacks & Bakery', sub: 'Biscuits', brand: 'Maliban', sup: 'Silavathurai Traders', price: 200, cost: 160, vars: ['190g', '330g', '500g'], weight: 2 },
  { name: 'Chocolate Cream', cat: 'Snacks & Bakery', sub: 'Biscuits', brand: 'Munchee', sup: 'Illuppaikkadavai Supply', price: 120, cost: 100, vars: ['100g', '400g'], weight: 2 },
  { name: 'Butter Cake', cat: 'Snacks & Bakery', sub: 'Cakes & Buns', brand: 'Mannar Best', sup: 'Mannar Hub Logistics', price: 400, cost: 300, vars: ['250g', '500g'], weight: 1 },
  { name: 'Tea Bun', cat: 'Snacks & Bakery', sub: 'Cakes & Buns', brand: 'Mannar Best', sup: 'Mannar Hub Logistics', price: 80, cost: 60, vars: ['1pcs', '5pcs'], weight: 2 },
  { name: 'Milk Chocolate', cat: 'Snacks & Bakery', sub: 'Sweets & Chocolates', brand: 'Ceylon Gold', sup: 'Adampan Distributors', price: 250, cost: 200, vars: ['50g', '100g', '200g'], weight: 1 },
  // Personal Care
  { name: 'Sunlight Soap', cat: 'Personal Care', sub: 'Soaps & Body Wash', brand: 'Sunlight', sup: 'Vankalai Wholesale', price: 80, cost: 65, vars: ['120g', '120g x 4'], weight: 3 },
  { name: 'Lifebuoy Total 10', cat: 'Personal Care', sub: 'Soaps & Body Wash', brand: 'Lifebuoy', sup: 'Thalaimannar Distributors', price: 120, cost: 100, vars: ['100g', '100g x 4'], weight: 2 },
  { name: 'Clear Anti-Dandruff', cat: 'Personal Care', sub: 'Hair Care', brand: 'Lifebuoy', sup: 'Pesalai Traders', price: 650, cost: 550, vars: ['170ml', '330ml'], weight: 1 },
  { name: 'Signal Toothpaste', cat: 'Personal Care', sub: 'Oral Care', brand: 'Lifebuoy', sup: 'Nanaddan Grocers', price: 240, cost: 200, vars: ['120g', '160g'], weight: 2 },
  { name: 'Aloe Vera Lotion', cat: 'Personal Care', sub: 'Skin Care', brand: 'Mannar Best', sup: 'Mannar Sea Foods', price: 450, cost: 350, vars: ['100ml', '200ml'], weight: 1 },
];

// ═══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now();
  const DAY_ZERO = new Date('2025-01-01T00:00:00Z');

  // ─── CLEAR ALL DATA ───
  console.log('🧹 Clearing all existing data...');
  await prisma.userNotificationState.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.discountComboItem.deleteMany();
  await prisma.discountProduct.deleteMany();
  await prisma.refundItem.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.grnItem.deleteMany();
  await prisma.goodsReceivingNote.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.masterProductClass.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // ─── PHASE 1: MASTER DATA ───
  console.log('📦 Creating Suppliers...');
  const supplierMap: Record<string, any> = {};
  for (const s of suppliersRaw) {
    supplierMap[s.name] = await prisma.supplier.create({
      data: { name: s.name, companyName: s.name, email: s.email, phone: s.phone, address: s.address, createdAt: DAY_ZERO }
    });
  }

  console.log('📂 Creating Categories & Subcategories...');
  const catMap: Record<string, any> = {};
  const subMap: Record<string, any> = {};
  for (const c of categoriesRaw) {
    const cat = await prisma.category.create({ data: { name: c.name, description: `All ${c.name}`, categoryImageUrl: c.image } });
    catMap[c.name] = cat;
    for (const sub of c.subs) {
      subMap[`${c.name}-${sub}`] = await prisma.subCategory.create({ data: { name: sub, categoryId: cat.id } });
    }
  }

  console.log('🏷️ Creating Brands...');
  const brandMap: Record<string, any> = {};
  for (const b of brandsRaw) {
    brandMap[b] = await prisma.brand.create({ data: { name: b, state: BrandState.ACTIVE } });
  }

  console.log('🛒 Creating Products...');
  interface ProductRec { sku: string; name: string; sellingPrice: number; costPrice: number; baseName: string; supplierName: string; weight: number }
  const products: ProductRec[] = [];
  const stock: Record<string, number> = {};
  let skuSeq = 1;

  for (const bp of baseProducts) {
    const master = await prisma.masterProductClass.create({
      data: {
        name: bp.name, categoryId: catMap[bp.cat].id,
        subCategoryId: subMap[`${bp.cat}-${bp.sub}`].id,
        brandId: brandMap[bp.brand].id, supplierId: supplierMap[bp.sup].id,
        hasVariant: bp.vars.length > 1, createdAt: DAY_ZERO,
      }
    });

    for (const v of bp.vars) {
      const mult = varMult(v);
      const sellingPrice = Math.round(bp.price * mult);
      const costPrice = Math.round(bp.cost * mult);
      const sku = makeSku(bp.brand, bp.name, v, skuSeq++);
      const barcode = genBarcode();
      const unitType = v.replace(/[0-9.]/g, '').trim().toUpperCase() || 'PCS';

      await prisma.product.create({
        data: {
          sku, masterId: master.id, barcode, name: `${bp.name} ${v}`,
          unitType, costPrice, sellingPrice, currentStock: 0,
          reorderLevel: 15, targetCapacity: 100, status: ProductStatus.ACTIVE,
          imageUrl: `https://picsum.photos/seed/${sku}/600/600`,
          variantAttributeType: v, createdAt: DAY_ZERO, updatedAt: DAY_ZERO,
        }
      });

      products.push({ sku, name: `${bp.name} ${v}`, sellingPrice, costPrice, baseName: bp.name, supplierName: bp.sup, weight: bp.weight });
      stock[sku] = 0;
    }
  }
  console.log(`  ✅ Created ${products.length} SKUs`);

  // Build weighted product pool (popular products appear more)
  const weightedPool: ProductRec[] = [];
  for (const p of products) {
    for (let i = 0; i < p.weight; i++) weightedPool.push(p);
  }

  // Group products by supplier for GRN creation
  const productsBySupplier: Record<string, ProductRec[]> = {};
  for (const p of products) {
    if (!productsBySupplier[p.supplierName]) productsBySupplier[p.supplierName] = [];
    productsBySupplier[p.supplierName].push(p);
  }

  // ─── PHASE 2: USERS ───
  console.log('👥 Creating Users...');
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const managerHash = await bcrypt.hash('Manager@123', 12);
  const cashierHash = await bcrypt.hash('Cashier@123', 12);
  const arulHash = await bcrypt.hash('Arul@123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stocksense.com' }, update: {},
    create: { name: 'System Administrator', email: 'admin@stocksense.com', passwordHash: adminHash, role: Role.ADMIN, isActive: true },
  });
  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@stocksense.com' }, update: {},
    create: { name: 'Main Cashier', email: 'cashier@stocksense.com', passwordHash: cashierHash, role: Role.CASHIER, isActive: true },
  });
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@stocksense.com' }, update: {},
    create: { name: 'Stock Manager', email: 'manager@stocksense.com', passwordHash: managerHash, role: Role.INVENTORY_MANAGER, isActive: true },
  });
  await prisma.user.upsert({
    where: { email: 'arultharsan096@gmail.com' }, update: {},
    create: { name: 'Arultharsan (Cashier)', email: 'arultharsan096@gmail.com', passwordHash: arulHash, role: Role.CASHIER, isActive: true, phone: '0770960000' },
  });
  await prisma.user.upsert({
    where: { email: 'arultharisan1@gmail.com' }, update: {},
    create: { name: 'Arultharsan (Manager)', email: 'arultharisan1@gmail.com', passwordHash: arulHash, role: Role.INVENTORY_MANAGER, isActive: true, phone: '0711110000' },
  });

  // ─── PHASE 3: INITIAL STOCK GRNs (Day 1) ───
  console.log('📦 Establishing initial stock (Day 1 GRNs)...');
  for (const [supName, supProds] of Object.entries(productsBySupplier)) {
    const supplier = supplierMap[supName];
    const items = supProds.map(p => {
      const qty = p.weight === 3 ? ri(50, 80) : p.weight === 2 ? ri(35, 60) : ri(25, 45);
      stock[p.sku] += qty;
      return { sku: p.sku, addedQuantity: qty, finalQuantity: stock[p.sku], unitCost: p.costPrice };
    });
    await prisma.goodsReceivingNote.create({
      data: {
        grnId: nxtGrn(), supplierId: supplier.id, operatorId: managerUser.id,
        grnDate: DAY_ZERO, notes: 'Initial stock setup - Store opening inventory',
        items: { create: items }
      }
    });
  }
  console.log(`  ✅ Created ${grnN} initial GRNs`);

  // ─── PHASE 4: DISCOUNTS ───
  console.log('🎉 Creating Discounts...');
  interface DiscountTracker { id: string; type: string; discountValue: number; startStr?: string; endStr?: string; dateStr?: string; minBillAmount?: number; skus: Set<string> }
  const discountTrackers: DiscountTracker[] = [];

  const findSkus = (bases: string[]) => products.filter(p => bases.some(b => p.baseName === b)).map(p => p.sku);

  // SEASONAL Discounts
  const seasonalDefs = [
    { name: 'Thai Pongal Festival Offer', value: 15, start: '2025-01-10', end: '2025-01-20', label: 'PONGAL SPECIAL 15% OFF', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop', bases: ['Keeri Samba Rice', 'Nadu Rice', 'Mysore Dhal', 'White Sugar', 'Chilli Powder'], created: '2025-01-08' },
    { name: "Valentine's Day Treats", value: 10, start: '2025-02-12', end: '2025-02-15', label: 'VALENTINE SPECIAL 10% OFF', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop', bases: ['Milk Chocolate', 'Kist Orange Nectar', 'Mixed Fruit Juice', 'Butter Cake'], created: '2025-02-10' },
    { name: 'Ramadan Essentials Pack', value: 10, start: '2025-03-01', end: '2025-03-31', label: 'RAMADAN SAVINGS 10% OFF', img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=800&auto=format&fit=crop', bases: ['Keeri Samba Rice', 'Nadu Rice', 'White Sugar', 'Premium Tea Dust', 'Mysore Dhal'], created: '2025-02-27' },
    { name: 'Sinhala/Tamil New Year Mega Sale', value: 20, start: '2025-04-05', end: '2025-04-20', label: 'NEW YEAR MEGA 20% OFF', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop', bases: ['Keeri Samba Rice', 'White Sugar', 'Wheat Flour', 'Lemon Puff', 'Cream Cracker', 'Sunlight Soap'], created: '2025-04-02' },
    { name: 'Vesak Week Special', value: 15, start: '2025-05-10', end: '2025-05-18', label: 'VESAK SPECIAL 15% OFF', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop', bases: ['Keeri Samba Rice', 'White Sugar', 'Premium Tea Dust', 'Lemon Puff', 'Cream Cracker'], created: '2025-05-08' },
    { name: 'Mid-Year Clearance Sale', value: 12, start: '2025-06-15', end: '2025-06-30', label: 'MID-YEAR CLEARANCE', img: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=800&auto=format&fit=crop', bases: ['Sunlight Soap', 'Lifebuoy Total 10', 'Signal Toothpaste', 'Clear Anti-Dandruff', 'Chocolate Cream', 'Tea Bun'], created: '2025-06-13' },
  ];
  for (const sd of seasonalDefs) {
    const skus = findSkus(sd.bases);
    const d = await prisma.discount.create({
      data: {
        name: sd.name, type: 'SEASONAL', discountValue: sd.value,
        label: sd.label, imageUrl: sd.img,
        startDate: new Date(sd.start), endDate: new Date(sd.end),
        isActive: true, approvalStatus: 'APPROVED', createdAt: new Date(sd.created),
        discountProducts: { create: skus.map(sku => ({ sku })) }
      }
    });
    discountTrackers.push({ id: d.id, type: 'SEASONAL', discountValue: sd.value, startStr: sd.start, endStr: sd.end, skus: new Set(skus) });
  }

  // DAILY Flash Sales
  const dailyDefs = [
    { name: 'Dry Fish Flash Sale', value: 25, date: '2025-01-20', label: 'TODAY ONLY 25% OFF', bases: ['Katta Karuvadu', 'Sprats (Keeramin)'], created: '2025-01-19' },
    { name: 'Coffee Day Special', value: 20, date: '2025-02-08', label: 'COFFEE DAY 20% OFF', bases: ['Nescafe Classic', 'Ceylon Golden Tea'], created: '2025-02-07' },
    { name: 'Rice Super Saver Day', value: 30, date: '2025-03-15', label: 'MEGA RICE DEAL 30% OFF', bases: ['Keeri Samba Rice', 'Nadu Rice'], created: '2025-03-14' },
    { name: 'Biscuit Bonanza', value: 25, date: '2025-04-25', label: 'BISCUIT FEST 25% OFF', bases: ['Lemon Puff', 'Cream Cracker', 'Chocolate Cream'], created: '2025-04-24' },
    { name: 'Personal Care Day', value: 20, date: '2025-05-05', label: 'SELF-CARE SALE', bases: ['Sunlight Soap', 'Lifebuoy Total 10', 'Signal Toothpaste'], created: '2025-05-04' },
    { name: 'Juice Fest Friday', value: 25, date: '2025-06-18', label: 'JUICE FEST 25% OFF', bases: ['Kist Orange Nectar', 'Mixed Fruit Juice'], created: '2025-06-17' },
  ];
  for (const dd of dailyDefs) {
    const skus = findSkus(dd.bases);
    const d = await prisma.discount.create({
      data: {
        name: dd.name, type: 'DAILY', discountValue: dd.value,
        label: dd.label, dailyStartTime: '08:00', dailyEndTime: '20:00',
        applicableDate: new Date(dd.date),
        isActive: true, approvalStatus: 'APPROVED', createdAt: new Date(dd.created),
        discountProducts: { create: skus.map(sku => ({ sku })) }
      }
    });
    discountTrackers.push({ id: d.id, type: 'DAILY', discountValue: dd.value, dateStr: dd.date, skus: new Set(skus) });
  }

  // COMBO Discounts
  const comboDefs = [
    { name: 'Evening Tea Time Combo', value: 20, label: 'PERFECT PAIRING', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop', items: [{ base: 'Premium Tea Dust', v: '500g' }, { base: 'Cream Cracker', v: '330g' }, { base: 'White Sugar', v: '1Kg' }], created: '2025-01-01' },
    { name: 'Fish Curry Kit', value: 15, label: 'CURRY ESSENTIALS', img: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=800&auto=format&fit=crop', items: [{ base: 'Seer Fish (Thora)', v: '1Kg' }, { base: 'Chilli Powder', v: '100g' }, { base: 'Turmeric Powder', v: '100g' }], created: '2025-01-01' },
    { name: 'Family Hygiene Pack', value: 18, label: 'FAMILY PACK DEAL', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop', items: [{ base: 'Sunlight Soap', v: '120g' }, { base: 'Signal Toothpaste', v: '120g' }, { base: 'Clear Anti-Dandruff', v: '170ml' }], created: '2025-01-15' },
  ];
  for (const cd of comboDefs) {
    const comboSkus = cd.items.map(item => {
      const p = products.find(pr => pr.name === `${item.base} ${item.v}`);
      return p?.sku;
    }).filter(Boolean) as string[];
    if (comboSkus.length === cd.items.length) {
      await prisma.discount.create({
        data: {
          name: cd.name, type: 'COMBO', discountValue: cd.value,
          label: cd.label, imageUrl: cd.img,
          isActive: true, approvalStatus: 'APPROVED', createdAt: new Date(cd.created),
          comboItems: { create: comboSkus.map(sku => ({ sku, minQty: 1 })) }
        }
      });
    }
  }

  // BILL Discounts
  const billDiscDefs = [
    { name: 'Mega Cart Offer - 5%', value: 5, min: 5000, label: 'BILL OFFER 5%' },
    { name: 'Super Cart Offer - 8%', value: 8, min: 10000, label: 'BILL OFFER 8%' },
  ];
  for (const bd of billDiscDefs) {
    const d = await prisma.discount.create({
      data: {
        name: bd.name, type: 'BILL', discountValue: bd.value,
        minBillAmount: bd.min, label: bd.label,
        isActive: true, approvalStatus: 'APPROVED', createdAt: DAY_ZERO,
      }
    });
    discountTrackers.push({ id: d.id, type: 'BILL', discountValue: bd.value, minBillAmount: bd.min, skus: new Set() });
  }
  console.log(`  ✅ Created ${seasonalDefs.length + dailyDefs.length + comboDefs.length + billDiscDefs.length} discounts`);

  // ─── PHASE 5: DAY-BY-DAY SIMULATION (181 days) ───
  console.log('📊 Simulating 6 months of transactions (Jan 1 – Jul 1, 2025)...');
  console.log('   This may take a few minutes...\n');

  const TOTAL_DAYS = 181;
  interface BillRef { id: string; date: Date; items: { sku: string; qty: number; unitPrice: number }[] }
  const billRefs: BillRef[] = [];

  let nextGrnDay = 3;
  let nextAdjDay = 4;
  let adjCount = 0;
  const adjReasons = Object.values(AdjustmentReason);
  const payMethods = [PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.CARD, PaymentMethod.CARD, PaymentMethod.ONLINE];

  for (let dayNum = 0; dayNum < TOTAL_DAYS; dayNum++) {
    const today = addD(DAY_ZERO, dayNum);
    const todayStr = dKey(today);

    // ═══ RESTOCKING GRNs ═══
    if (dayNum >= nextGrnDay && dayNum > 0) {
      nextGrnDay = dayNum + ri(2, 4);

      // Find suppliers that have low-stock products
      const suppliersNeedRestock = Object.entries(productsBySupplier)
        .filter(([_, prods]) => prods.some(p => stock[p.sku] < 30))
        .sort(() => Math.random() - 0.5)
        .slice(0, ri(1, 3));

      for (const [supName, supProds] of suppliersNeedRestock) {
        const lowStock = supProds.filter(p => stock[p.sku] < 30);
        if (lowStock.length === 0) continue;

        const restockItems = pickN(lowStock, ri(2, Math.min(6, lowStock.length)));
        const grnItems = restockItems.map(p => {
          const qty = ri(40, 120);
          stock[p.sku] += qty;
          return { sku: p.sku, addedQuantity: qty, finalQuantity: stock[p.sku], unitCost: p.costPrice };
        });

        await prisma.goodsReceivingNote.create({
          data: {
            grnId: nxtGrn(), supplierId: supplierMap[supName].id, operatorId: managerUser.id,
            grnDate: rTime(today), notes: 'Routine restock delivery',
            items: { create: grnItems }
          }
        });
      }
    }

    // ═══ SALES BILLS ═══
    const billCount = dayBillCount(today);
    const dayProductDiscounts = discountTrackers.filter(d => {
      if (d.type === 'SEASONAL') return todayStr >= d.startStr! && todayStr <= d.endStr!;
      if (d.type === 'DAILY') return todayStr === d.dateStr!;
      return false;
    });

    const dayBillOps: any[] = [];
    const dayBillItemsData: { sku: string; qty: number; unitPrice: number }[][] = [];

    for (let b = 0; b < billCount; b++) {
      const numItems = ri(2, 5);
      const billItems: { sku: string; qty: number; unitPrice: number; total: number; discountValue: number; discountId?: string }[] = [];
      const usedSkus = new Set<string>();

      for (let j = 0; j < numItems; j++) {
        let product: ProductRec | null = null;
        for (let attempt = 0; attempt < 50; attempt++) {
          const candidate = pick(weightedPool);
          if (!usedSkus.has(candidate.sku) && stock[candidate.sku] > 0) {
            product = candidate;
            break;
          }
        }
        if (!product) {
          // Fallback: try any available product
          const available = products.filter(p => !usedSkus.has(p.sku) && stock[p.sku] > 0);
          if (available.length > 0) product = pick(available);
        }
        if (!product) break;

        usedSkus.add(product.sku);
        const qty = Math.min(ri(1, 3), stock[product.sku]);
        if (qty <= 0) continue;

        stock[product.sku] -= qty;
        const total = product.sellingPrice * qty;

        // Check for item-level discount
        let discountId: string | undefined;
        let discountValue = 0;
        const applicable = dayProductDiscounts.find(d => d.skus.has(product!.sku));
        if (applicable && Math.random() < 0.4) {
          discountId = applicable.id;
          discountValue = Math.round(total * applicable.discountValue / 100);
        }

        billItems.push({ sku: product.sku, qty, unitPrice: product.sellingPrice, total, discountValue, discountId });
      }

      if (billItems.length === 0) continue;

      const subtotal = billItems.reduce((s, i) => s + i.total, 0);
      const itemDiscountTotal = billItems.reduce((s, i) => s + i.discountValue, 0);
      const netAmount = subtotal - itemDiscountTotal;

      // Bill-level discount
      let billDiscAmt = 0;
      const billD = discountTrackers
        .filter(d => d.type === 'BILL' && d.minBillAmount && netAmount >= d.minBillAmount)
        .sort((a, b) => (b.minBillAmount || 0) - (a.minBillAmount || 0))[0];
      if (billD) billDiscAmt = Math.round(netAmount * billD.discountValue / 100);

      const totalDiscount = itemDiscountTotal + billDiscAmt;
      const totalBill = Math.max(0, subtotal - totalDiscount);
      const totalQty = billItems.reduce((s, i) => s + i.qty, 0);
      const payMethod = pick(payMethods);
      const paidAmount = payMethod === PaymentMethod.CASH ? Math.ceil(totalBill / 100) * 100 : totalBill;
      const changeAmount = Math.round((paidAmount - totalBill) * 100) / 100;

      dayBillOps.push(prisma.bill.create({
        data: {
          billNumber: nxtBill(), cashierId: cashierUser.id,
          subtotal, totalDiscount, totalBill,
          paymentMethod: payMethod, totalQty, draft: false,
          paidAmount, changeAmount,
          createdAt: rTime(today),
          billItems: {
            create: billItems.map(i => ({
              sku: i.sku, qty: i.qty, unitPrice: i.unitPrice,
              total: i.total, discountValue: i.discountValue,
              ...(i.discountId ? { discountId: i.discountId } : {}),
            }))
          }
        }
      }));
      dayBillItemsData.push(billItems.map(i => ({ sku: i.sku, qty: i.qty, unitPrice: i.unitPrice })));
    }

    // Execute day's bills in a single transaction
    if (dayBillOps.length > 0) {
      const results = await prisma.$transaction(dayBillOps);
      for (let i = 0; i < results.length; i++) {
        billRefs.push({ id: results[i].id, date: today, items: dayBillItemsData[i] });
      }
    }

    // ═══ STOCK ADJUSTMENTS ═══
    if (dayNum >= nextAdjDay) {
      nextAdjDay = dayNum + ri(3, 5);
      const adjNum = ri(1, 2);
      for (let a = 0; a < adjNum; a++) {
        const p = pick(products);
        if (stock[p.sku] <= 0) continue;
        const qtyChanged = -ri(1, Math.min(5, stock[p.sku]));
        stock[p.sku] += qtyChanged;
        await prisma.stockAdjustment.create({
          data: {
            sku: p.sku, qtyChanged, reason: pick(adjReasons),
            adjustedById: managerUser.id, finalQuantity: Math.max(0, stock[p.sku]),
            createdAt: rTime(today)
          }
        });
        adjCount++;
      }
    }

    // Progress log every 30 days
    if ((dayNum + 1) % 30 === 0 || dayNum === TOTAL_DAYS - 1) {
      const month = Math.ceil((dayNum + 1) / 30);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  📅 Month ${month} done: ${billN} bills | ${grnN} GRNs | ${adjCount} adjustments  [${elapsed}s]`);
    }
  }

  console.log(`\n✅ Simulation complete: ${billN} bills, ${grnN} GRNs, ${adjCount} adjustments`);

  // ─── PHASE 6: REFUNDS ───
  console.log('💰 Creating refunds (~5% of bills)...');
  const refundCount = Math.floor(billRefs.length * 0.05);
  const refundBills = pickN(billRefs, refundCount);

  for (const bill of refundBills) {
    if (bill.items.length === 0) continue;
    const refItemCount = ri(1, Math.min(2, bill.items.length));
    const refItems = pickN(bill.items, refItemCount).map(item => {
      const refQty = ri(1, item.qty);
      stock[item.sku] += refQty; // Restore stock
      return { sku: item.sku, qty: refQty, refundValue: refQty * item.unitPrice };
    });

    const refundAmount = refItems.reduce((s, i) => s + i.refundValue, 0);
    await prisma.refund.create({
      data: {
        refundNumber: nxtRef(), originalBillId: bill.id, cashierId: cashierUser.id,
        refundAmount, createdAt: addD(bill.date, ri(1, 3)),
        refundItems: { create: refItems }
      }
    });
  }
  console.log(`  ✅ Created ${refN} refunds`);

  // ─── PHASE 7: FINAL STOCK LEVELS & NOTIFICATIONS ───
  console.log('📈 Updating final stock levels...');

  // Update all products with tracked stock
  for (const p of products) {
    await prisma.product.update({
      where: { sku: p.sku },
      data: { currentStock: Math.max(0, stock[p.sku]) }
    });
  }

  // Force specific stock states for testing notifications
  const forceLow = pickN(products.filter(p => stock[p.sku] > 5), 4);
  for (const p of forceLow) {
    stock[p.sku] = ri(3, 8);
    await prisma.product.update({ where: { sku: p.sku }, data: { currentStock: stock[p.sku], reorderLevel: 10 } });
  }

  const forceOOS = pickN(products.filter(p => !forceLow.some(fl => fl.sku === p.sku)), 4);
  for (const p of forceOOS) {
    stock[p.sku] = 0;
    await prisma.product.update({ where: { sku: p.sku }, data: { currentStock: 0 } });
  }

  const forceOver = pickN(products.filter(p => !forceLow.includes(p) && !forceOOS.includes(p)), 2);
  for (const p of forceOver) {
    stock[p.sku] = 250;
    await prisma.product.update({ where: { sku: p.sku }, data: { currentStock: 250, targetCapacity: 100 } });
  }

  // Set expiry dates on perishable products
  const perishables = products.filter(p =>
    ['Seer Fish (Thora)', 'Tiger Prawns', 'Mud Crab', 'Butter Cake', 'Tea Bun'].some(n => p.baseName === n)
  );
  const expiringProducts = pickN(perishables, Math.min(4, perishables.length));
  for (let i = 0; i < expiringProducts.length; i++) {
    const expDate = i < 2
      ? addD(new Date('2025-07-01'), ri(3, 7))  // Expiring soon
      : addD(new Date('2025-07-01'), -ri(1, 3)); // Already expired
    await prisma.product.update({
      where: { sku: expiringProducts[i].sku },
      data: { expiryDate: expDate }
    });
  }

  // Force dead stock (old product, no movement)
  const deadStockProducts = pickN(products.filter(p => p.weight === 1 && !forceLow.includes(p) && !forceOOS.includes(p)), 2);
  for (const p of deadStockProducts) {
    await prisma.product.update({
      where: { sku: p.sku },
      data: { currentStock: 45, createdAt: new Date('2024-06-01T00:00:00Z') }
    });
  }

  // Create notifications
  console.log('🔔 Creating notifications...');
  const notifs: { type: NotificationType; severity: NotificationSeverity; title: string; msg: string; sku: string; users: string[] }[] = [];

  // Low Stock
  for (const p of forceLow) {
    notifs.push({ type: NotificationType.LOW_STOCK, severity: NotificationSeverity.WARNING, title: 'Low Stock Alert', msg: `${p.name} is running low (${stock[p.sku]} units remaining). Reorder soon.`, sku: p.sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }

  // Out of Stock
  for (const p of forceOOS) {
    notifs.push({ type: NotificationType.OUT_OF_STOCK, severity: NotificationSeverity.CRITICAL, title: 'Out of Stock', msg: `${p.name} is completely out of stock. Immediate reorder required.`, sku: p.sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }

  // Expiring Soon
  for (let i = 0; i < 2 && i < expiringProducts.length; i++) {
    notifs.push({ type: NotificationType.EXPIRING_SOON, severity: NotificationSeverity.WARNING, title: 'Item Expiring Soon', msg: `${expiringProducts[i].name} batch expires within ${ri(3, 7)} days. Plan clearance.`, sku: expiringProducts[i].sku, users: [adminUser.id, managerUser.id] });
  }

  // Expired
  for (let i = 2; i < 4 && i < expiringProducts.length; i++) {
    notifs.push({ type: NotificationType.EXPIRED, severity: NotificationSeverity.CRITICAL, title: 'Item Expired', msg: `${expiringProducts[i].name} has expired. Remove from shelf immediately.`, sku: expiringProducts[i].sku, users: [adminUser.id, managerUser.id] });
  }

  // Overstock
  for (const p of forceOver) {
    notifs.push({ type: NotificationType.OVERSTOCK, severity: NotificationSeverity.INFO, title: 'Overstock Detected', msg: `${p.name} exceeds target capacity (250/100 units).`, sku: p.sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }

  // Dead Stock
  for (const p of deadStockProducts) {
    notifs.push({ type: NotificationType.STOCK_VELOCITY, severity: NotificationSeverity.INFO, title: 'Dead Stock Warning', msg: `${p.name} has had zero movement in the last 45+ days.`, sku: p.sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }

  // Discount Approval (to Admin)
  const discApproval = pickN(products, 2);
  for (const p of discApproval) {
    notifs.push({ type: NotificationType.DISCOUNT_APPROVAL, severity: NotificationSeverity.INFO, title: 'Discount Approval Required', msg: `New discount campaign for ${p.name} requires your approval.`, sku: p.sku, users: [adminUser.id] });
  }

  // Discount Response (to Manager)
  const discResponse = pickN(products, 2);
  for (const p of discResponse) {
    notifs.push({ type: NotificationType.DISCOUNT_RESPONSE, severity: NotificationSeverity.INFO, title: 'Discount Approved', msg: `Admin approved your discount campaign for ${p.name}.`, sku: p.sku, users: [managerUser.id] });
  }

  for (const n of notifs) {
    await prisma.notification.create({
      data: {
        type: n.type, severity: n.severity, title: n.title, message: n.msg, sku: n.sku,
        userStates: { create: n.users.map(uid => ({ userId: uid })) }
      }
    });
  }
  console.log(`  ✅ Created ${notifs.length} notifications`);

  // ─── SUMMARY ───
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📅 Period       : Jan 1, 2025 → Jul 1, 2025 (181 days)`);
  console.log(`📦 Suppliers    : ${suppliersRaw.length}`);
  console.log(`🏷️  Brands       : ${brandsRaw.length}`);
  console.log(`🛒 Products     : ${products.length} SKUs`);
  console.log(`👥 Users        : 5`);
  console.log(`📑 GRNs         : ${grnN}`);
  console.log(`🧾 Sales Bills  : ${billN}`);
  console.log(`⚖️  Adjustments  : ${adjCount}`);
  console.log(`💰 Refunds      : ${refN}`);
  console.log(`🎉 Discounts    : ${seasonalDefs.length + dailyDefs.length + comboDefs.length + billDiscDefs.length}`);
  console.log(`🔔 Notifications: ${notifs.length}`);
  console.log(`⏱️  Time         : ${totalTime}s`);
  console.log('═══════════════════════════════════════════════════\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
