import 'dotenv/config';
import { PrismaClient, BrandState, ProductStatus, Role, PaymentMethod, NotificationType, NotificationSeverity, AdjustmentReason } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

let barcodeSeq = 479100000000;
function generateBarcode(): string {
  barcodeSeq++;
  const base = barcodeSeq.toString();
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  return `${base}${check}`;
}

function makeSku(brand: string, product: string, size: string, seq: number): string {
  const b = brand.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const p = product.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const s = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${b}-${p}-${s}-${seq.toString().padStart(4, '0')}`;
}

async function main() {
  console.log('🧹 Clearing all data...');
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

  // 1. 10 Suppliers (Mannar Localized)
  console.log('📦 Seeding 10 Mannar Suppliers...');
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

  const baseDate = new Date('2024-01-01T00:00:00Z');
  const supplierMap: Record<string, any> = {};
  for (const s of suppliersRaw) {
    supplierMap[s.name] = await prisma.supplier.create({
      data: { name: s.name, companyName: s.name, email: s.email, phone: s.phone, address: s.address, createdAt: baseDate }
    });
  }

  // 2. 5 Categories, 3-4 Subcategories
  console.log('📂 Seeding 5 Categories & Subcategories...');
  const categoriesRaw = [
    { name: 'Seafood & Dry Fish', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=800&auto=format&fit=crop', subs: ['Fresh Fish', 'Dry Fish (Karuvadu)', 'Prawns', 'Crab'] },
    { name: 'Groceries & Staples', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop', subs: ['Rice', 'Flour & Sugar', 'Spices & Condiments', 'Pulses'] },
    { name: 'Beverages', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&auto=format&fit=crop', subs: ['Tea & Coffee', 'Soft Drinks', 'Fruit Juices'] },
    { name: 'Snacks & Bakery', image: 'https://images.unsplash.com/photo-1599599810765-bfb1a31656d5?q=80&w=800&auto=format&fit=crop', subs: ['Biscuits', 'Cakes & Buns', 'Sweets & Chocolates'] },
    { name: 'Personal Care', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop', subs: ['Soaps & Body Wash', 'Hair Care', 'Oral Care', 'Skin Care'] }
  ];

  const categoryMap: Record<string, any> = {};
  const subCategoryMap: Record<string, any> = {};
  for (const c of categoriesRaw) {
    const cat = await prisma.category.create({ data: { name: c.name, description: `All ${c.name}`, categoryImageUrl: c.image } });
    categoryMap[c.name] = cat;
    for (const sub of c.subs) {
      const createdSub = await prisma.subCategory.create({ data: { name: sub, categoryId: cat.id } });
      subCategoryMap[`${c.name}-${sub}`] = createdSub;
    }
  }

  // 3. 10 Brands
  console.log('🏷️ Seeding 10 Brands...');
  const brandsRaw = ['Mannar Best', 'Pesalai Catch', 'Ceylon Gold', 'Munchee', 'Maliban', 'Sunlight', 'Lifebuoy', 'Nescafe', 'Dilmah', 'Kist'];
  const brandMap: Record<string, any> = {};
  for (const b of brandsRaw) {
    brandMap[b] = await prisma.brand.create({ data: { name: b, state: BrandState.ACTIVE } });
  }

  // 4. Products (100-150 SKUs)
  console.log('🛒 Generating 100+ Products...');
  
  // Base products definition
  const baseProducts = [
    // Seafood & Dry Fish
    { name: 'Seer Fish (Thora)', cat: 'Seafood & Dry Fish', sub: 'Fresh Fish', brand: 'Pesalai Catch', sup: 'Pesalai Traders', price: 1800, cost: 1500, vars: ['500g', '1Kg'] },
    { name: 'Katta Karuvadu', cat: 'Seafood & Dry Fish', sub: 'Dry Fish (Karuvadu)', brand: 'Mannar Best', sup: 'Mannar Sea Foods', price: 2200, cost: 1800, vars: ['250g', '500g', '1Kg'] },
    { name: 'Sprats (Keeramin)', cat: 'Seafood & Dry Fish', sub: 'Dry Fish (Karuvadu)', brand: 'Pesalai Catch', sup: 'Pesalai Traders', price: 1100, cost: 900, vars: ['250g', '500g', '1Kg'] },
    { name: 'Tiger Prawns', cat: 'Seafood & Dry Fish', sub: 'Prawns', brand: 'Mannar Best', sup: 'Silavathurai Traders', price: 2500, cost: 2100, vars: ['500g', '1Kg'] },
    { name: 'Mud Crab', cat: 'Seafood & Dry Fish', sub: 'Crab', brand: 'Mannar Best', sup: 'Vankalai Wholesale', price: 1500, cost: 1200, vars: ['1Kg', '2Kg'] },
    { name: 'Kumbalava Dry Fish', cat: 'Seafood & Dry Fish', sub: 'Dry Fish (Karuvadu)', brand: 'Mannar Best', sup: 'Illuppaikkadavai Supply', price: 900, cost: 750, vars: ['500g', '1Kg'] },

    // Groceries
    { name: 'Keeri Samba Rice', cat: 'Groceries & Staples', sub: 'Rice', brand: 'Ceylon Gold', sup: 'Murunkan Mills', price: 350, cost: 300, vars: ['1Kg', '2Kg', '5Kg', '10Kg', '25Kg', '50Kg'] },
    { name: 'Nadu Rice', cat: 'Groceries & Staples', sub: 'Rice', brand: 'Ceylon Gold', sup: 'Murunkan Mills', price: 220, cost: 190, vars: ['1Kg', '2Kg', '5Kg', '10Kg', '25Kg', '50Kg'] },
    { name: 'Wheat Flour', cat: 'Groceries & Staples', sub: 'Flour & Sugar', brand: 'Mannar Best', sup: 'Nanaddan Grocers', price: 210, cost: 180, vars: ['500g', '1Kg', '2Kg', '5Kg', '10Kg'] },
    { name: 'White Sugar', cat: 'Groceries & Staples', sub: 'Flour & Sugar', brand: 'Mannar Best', sup: 'Thalaimannar Distributors', price: 320, cost: 280, vars: ['500g', '1Kg', '2Kg', '5Kg'] },
    { name: 'Chilli Powder', cat: 'Groceries & Staples', sub: 'Spices & Condiments', brand: 'Ceylon Gold', sup: 'Mannar Hub Logistics', price: 1500, cost: 1200, vars: ['50g', '100g', '250g', '500g', '1Kg'] },
    { name: 'Turmeric Powder', cat: 'Groceries & Staples', sub: 'Spices & Condiments', brand: 'Ceylon Gold', sup: 'Adampan Distributors', price: 1600, cost: 1300, vars: ['50g', '100g', '250g', '500g', '1Kg'] },
    { name: 'Mysore Dhal', cat: 'Groceries & Staples', sub: 'Pulses', brand: 'Mannar Best', sup: 'Nanaddan Grocers', price: 400, cost: 340, vars: ['250g', '500g', '1Kg', '2Kg', '5Kg', '10Kg'] },

    // Beverages
    { name: 'Premium Tea Dust', cat: 'Beverages', sub: 'Tea & Coffee', brand: 'Dilmah', sup: 'Mannar Hub Logistics', price: 250, cost: 200, vars: ['100g', '200g', '500g', '1Kg'] },
    { name: 'Nescafe Classic', cat: 'Beverages', sub: 'Tea & Coffee', brand: 'Nescafe', sup: 'Thalaimannar Distributors', price: 1450, cost: 1200, vars: ['50g', '100g', '200g'] },
    { name: 'Ceylon Golden Tea', cat: 'Beverages', sub: 'Tea & Coffee', brand: 'Ceylon Gold', sup: 'Mannar Hub Logistics', price: 300, cost: 240, vars: ['100g', '200g', '400g'] },
    { name: 'Kist Orange Nectar', cat: 'Beverages', sub: 'Fruit Juices', brand: 'Kist', sup: 'Vankalai Wholesale', price: 850, cost: 700, vars: ['1L', '2L'] },
    { name: 'Mixed Fruit Juice', cat: 'Beverages', sub: 'Fruit Juices', brand: 'Kist', sup: 'Adampan Distributors', price: 900, cost: 750, vars: ['1L'] },

    // Snacks
    { name: 'Lemon Puff', cat: 'Snacks & Bakery', sub: 'Biscuits', brand: 'Munchee', sup: 'Nanaddan Grocers', price: 150, cost: 120, vars: ['100g', '200g', '400g'] },
    { name: 'Cream Cracker', cat: 'Snacks & Bakery', sub: 'Biscuits', brand: 'Maliban', sup: 'Silavathurai Traders', price: 200, cost: 160, vars: ['190g', '330g', '500g'] },
    { name: 'Chocolate Cream', cat: 'Snacks & Bakery', sub: 'Biscuits', brand: 'Munchee', sup: 'Illuppaikkadavai Supply', price: 120, cost: 100, vars: ['100g', '400g'] },
    { name: 'Butter Cake', cat: 'Snacks & Bakery', sub: 'Cakes & Buns', brand: 'Mannar Best', sup: 'Mannar Hub Logistics', price: 400, cost: 300, vars: ['250g', '500g'] },
    { name: 'Tea Bun', cat: 'Snacks & Bakery', sub: 'Cakes & Buns', brand: 'Mannar Best', sup: 'Mannar Hub Logistics', price: 80, cost: 60, vars: ['1pcs', '5pcs'] },
    { name: 'Milk Chocolate', cat: 'Snacks & Bakery', sub: 'Sweets & Chocolates', brand: 'Ceylon Gold', sup: 'Adampan Distributors', price: 250, cost: 200, vars: ['50g', '100g', '200g'] },

    // Personal Care
    { name: 'Sunlight Soap', cat: 'Personal Care', sub: 'Soaps & Body Wash', brand: 'Sunlight', sup: 'Vankalai Wholesale', price: 80, cost: 65, vars: ['120g', '120g x 4'] },
    { name: 'Lifebuoy Total 10', cat: 'Personal Care', sub: 'Soaps & Body Wash', brand: 'Lifebuoy', sup: 'Thalaimannar Distributors', price: 120, cost: 100, vars: ['100g', '100g x 4'] },
    { name: 'Clear Anti-Dandruff', cat: 'Personal Care', sub: 'Hair Care', brand: 'Lifebuoy', sup: 'Pesalai Traders', price: 650, cost: 550, vars: ['170ml', '330ml'] },
    { name: 'Signal Toothpaste', cat: 'Personal Care', sub: 'Oral Care', brand: 'Lifebuoy', sup: 'Nanaddan Grocers', price: 240, cost: 200, vars: ['120g', '160g'] },
    { name: 'Aloe Vera Lotion', cat: 'Personal Care', sub: 'Skin Care', brand: 'Mannar Best', sup: 'Mannar Sea Foods', price: 450, cost: 350, vars: ['100ml', '200ml'] },
  ];

  let totalSkus = 0;
  let currentSeq = 1;
  const createdProducts = [];

  for (const mp of baseProducts) {
    const category = categoryMap[mp.cat];
    const subCategory = subCategoryMap[`${mp.cat}-${mp.sub}`];
    const brand = brandMap[mp.brand];
    const supplier = supplierMap[mp.sup];

    const master = await prisma.masterProductClass.create({
      data: {
        name: mp.name,
        categoryId: category.id,
        subCategoryId: subCategory.id,
        brandId: brand.id,
        supplierId: supplier.id,
        hasVariant: mp.vars.length > 1,
        createdAt: baseDate
      }
    });

    for (const v of mp.vars) {
      // Create price variations based on variant size
      let mult = 1;
      if (v.includes('50Kg')) mult = 50;
      else if (v.includes('25Kg')) mult = 25;
      else if (v.includes('10Kg')) mult = 10;
      else if (v.includes('5Kg')) mult = 5;
      else if (v.includes('2Kg') || v.includes('2L')) mult = 2;
      else if (v.includes('1Kg') || v.includes('1L') || v.includes('1pcs')) mult = 1;
      else if (v.includes('500g')) mult = 0.5;
      else if (v.includes('400g') || v.includes('330g')) mult = 0.4;
      else if (v.includes('250g')) mult = 0.25;
      else if (v.includes('200g')) mult = 0.2;
      else if (v.includes('100g') || v.includes('120g')) mult = 0.1;
      else if (v.includes('50g')) mult = 0.05;
      else if (v.includes('x 4') || v.includes('5pcs')) mult = 4;

      const pPrice = Math.round(mp.price * mult);
      const cPrice = Math.round(mp.cost * mult);
      const sku = makeSku(mp.brand, mp.name, v, currentSeq++);
      const barcode = generateBarcode();
      const unitType = v.replace(/[0-9.]/g, '').trim().toUpperCase() || 'PCS';
      const stock = Math.floor(Math.random() * 80) + 10;
      
      // Each product gets a distinct image using picsum seed
      const distinctImageUrl = `https://picsum.photos/seed/${sku}/600/600`;

      const product = await prisma.product.create({
        data: {
          sku,
          masterId: master.id,
          barcode,
          name: `${mp.name} ${v}`,
          unitType,
          costPrice: cPrice,
          sellingPrice: pPrice,
          currentStock: stock,
          reorderLevel: 15,
          targetCapacity: 100,
          status: ProductStatus.ACTIVE,
          imageUrl: distinctImageUrl,
          variantAttributeType: v,
          createdAt: baseDate,
          updatedAt: baseDate
        }
      });
      createdProducts.push(product);
      totalSkus++;
    }
  }
  console.log(`✅ Generated ${totalSkus} SKUs with distinct images.`);

  // 5. Users
  console.log('👥 Seeding Users...');
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const managerHash = await bcrypt.hash('Manager@123', 12);
  const cashierHash = await bcrypt.hash('Cashier@123', 12);
  const arulHash = await bcrypt.hash('Arul@123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stocksense.com' }, update: {},
    create: { name: 'System Administrator', email: 'admin@stocksense.com', passwordHash: adminHash, role: Role.ADMIN, isActive: true },
  });
  
  // Primary Accounts (Used in Seed logic below)
  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@stocksense.com' }, update: {},
    create: { name: 'Main Cashier', email: 'cashier@stocksense.com', passwordHash: cashierHash, role: Role.CASHIER, isActive: true },
  });
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@stocksense.com' }, update: {},
    create: { name: 'Stock Manager', email: 'manager@stocksense.com', passwordHash: managerHash, role: Role.INVENTORY_MANAGER, isActive: true },
  });

  // Secondary Accounts (User requested)
  await prisma.user.upsert({
    where: { email: 'arultharsan096@gmail.com' }, update: {},
    create: { name: 'Arultharsan (Cashier)', email: 'arultharsan096@gmail.com', passwordHash: arulHash, role: Role.CASHIER, isActive: true, phone: '0770960000' },
  });
  await prisma.user.upsert({
    where: { email: 'arultharisan1@gmail.com' }, update: {},
    create: { name: 'Arultharsan (Manager)', email: 'arultharisan1@gmail.com', passwordHash: arulHash, role: Role.INVENTORY_MANAGER, isActive: true, phone: '0711110000' },
  });

  // GRN (Goods Receiving Note)
  console.log('📦 Seeding GRNs...');
  for(let i=1; i<=10; i++) {
     const supplierKey = Object.keys(supplierMap)[Math.floor(Math.random() * 10)];
     const supplier = supplierMap[supplierKey];
     const items = [];
     for(let j=0; j<2; j++) {
       const p = createdProducts[Math.floor(Math.random() * createdProducts.length)];
       items.push({ sku: p.sku, addedQuantity: 50, finalQuantity: p.currentStock, unitCost: p.costPrice });
     }
     await prisma.goodsReceivingNote.create({
       data: {
          grnId: `GRN-2026-${i.toString().padStart(4, '0')}`,
          supplierId: supplier.id,
          operatorId: managerUser.id,
          grnDate: new Date(Date.now() - Math.floor(Math.random() * 15) * 86400000),
          notes: 'Routine Restock',
          items: { create: items }
       }
     });
  }

  // Stock Adjustments
  console.log('⚖️ Seeding Stock Adjustments...');
  const reasons = Object.values(AdjustmentReason);
  for(let i=1; i<=10; i++) {
     const p = createdProducts[Math.floor(Math.random() * createdProducts.length)];
     await prisma.stockAdjustment.create({
       data: {
          sku: p.sku,
          qtyChanged: -Math.floor(Math.random() * 5) - 1, // negative adjustment
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          adjustedById: managerUser.id,
          finalQuantity: p.currentStock - 2, // approximation
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000)
       }
     });
  }

  // 6. Distinct Offers (Combo, Seasonal, Daily, Bill)
  console.log('🎉 Seeding Distinct Offers...');
  const teaProduct = createdProducts.find(p => p.name.includes('Premium Tea Dust 500g'));
  const biscuitProduct = createdProducts.find(p => p.name.includes('Cream Cracker 330g'));
  const sugarProduct = createdProducts.find(p => p.name.includes('White Sugar 1Kg'));
  const riceProduct = createdProducts.find(p => p.name.includes('Keeri Samba Rice 5Kg'));
  const dhalProduct = createdProducts.find(p => p.name.includes('Mysore Dhal 1Kg'));
  const fishProduct = createdProducts.find(p => p.name.includes('Katta Karuvadu 500g'));

  // COMBO: Tea + Biscuit + Sugar
  if (teaProduct && biscuitProduct && sugarProduct) {
    await prisma.discount.create({
      data: {
        name: 'Evening Tea Time Combo',
        type: 'COMBO',
        discountValue: 20,
        label: 'PERFECT PAIRING',
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop',
        isActive: true,
        approvalStatus: 'APPROVED',
        comboItems: {
          create: [
            { sku: teaProduct.sku, minQty: 1 },
            { sku: biscuitProduct.sku, minQty: 1 },
            { sku: sugarProduct.sku, minQty: 1 }
          ]
        }
      }
    });
  }

  // SEASONAL: Rice + Dhal (Festive Grocery Pack)
  if (riceProduct && dhalProduct) {
    await prisma.discount.create({
      data: {
        name: 'Festive Grocery Savings',
        type: 'SEASONAL',
        discountValue: 15,
        label: 'FESTIVAL SPECIAL 15% OFF',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        isActive: true,
        approvalStatus: 'APPROVED',
        discountProducts: {
          create: [
            { sku: riceProduct.sku },
            { sku: dhalProduct.sku }
          ]
        }
      }
    });
  }

  // DAILY FLASH: Premium Dry Fish
  if (fishProduct) {
    await prisma.discount.create({
      data: {
        name: 'Mannar Special Flash Sale',
        type: 'DAILY',
        discountValue: 30,
        label: 'TODAY ONLY',
        imageUrl: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=800&auto=format&fit=crop',
        dailyStartTime: '10:00',
        dailyEndTime: '18:00',
        applicableDate: new Date(),
        isActive: true,
        approvalStatus: 'APPROVED',
        discountProducts: {
          create: [
            { sku: fishProduct.sku }
          ]
        }
      }
    });
  }

  // BILL: Buy above 5000 get 5% off
  await prisma.discount.create({
    data: {
      name: 'Mega Cart Offer',
      type: 'BILL',
      discountValue: 5,
      minBillAmount: 5000,
      label: 'BILL OFFER',
      isActive: true,
      approvalStatus: 'APPROVED',
    }
  });

  // 7. Adjust Products & Generate Diverse Notifications
  console.log('🔔 Adjusting Products & Seeding Required Notifications...');
  const notifs: any[] = [];
  
  // Low Stock x4 (i = 0 to 3)
  for(let i=0; i<4; i++) {
    await prisma.product.update({ where: { sku: createdProducts[i].sku }, data: { currentStock: 5, reorderLevel: 10 } });
    notifs.push({ type: NotificationType.LOW_STOCK, severity: NotificationSeverity.WARNING, title: 'Low Stock Alert', msg: `${createdProducts[i].name} is running low on stock.`, sku: createdProducts[i].sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }
  
  // Out of Stock x4 (i = 4 to 7)
  for(let i=4; i<8; i++) {
    await prisma.product.update({ where: { sku: createdProducts[i].sku }, data: { currentStock: 0 } });
    notifs.push({ type: NotificationType.OUT_OF_STOCK, severity: NotificationSeverity.CRITICAL, title: 'Out of Stock Alert', msg: `${createdProducts[i].name} is completely out of stock.`, sku: createdProducts[i].sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }
  
  // Expiring Soon (i = 8, 9) - WARNING
  for(let i=8; i<10; i++) {
    const expDate = new Date(Date.now() + 5 * 86400000);
    const dateStr = expDate.toLocaleDateString('en-GB');
    await prisma.product.update({ where: { sku: createdProducts[i].sku }, data: { expiryDate: expDate } });
    notifs.push({ type: NotificationType.EXPIRING_SOON, severity: NotificationSeverity.WARNING, title: 'Item Expiring Soon', msg: `${createdProducts[i].name} batch expires on ${dateStr} (in 5 Days).`, sku: createdProducts[i].sku, users: [adminUser.id, managerUser.id] });
  }
  
  // Expired (i = 10, 11) - CRITICAL
  for(let i=10; i<12; i++) {
    const expDate = new Date(Date.now() - 2 * 86400000);
    const dateStr = expDate.toLocaleDateString('en-GB');
    await prisma.product.update({ where: { sku: createdProducts[i].sku }, data: { expiryDate: expDate } });
    notifs.push({ type: NotificationType.EXPIRED, severity: NotificationSeverity.CRITICAL, title: 'Item Expired', msg: `${createdProducts[i].name} expired on ${dateStr}. Please remove from shelf immediately.`, sku: createdProducts[i].sku, users: [adminUser.id, managerUser.id] });
  }

  // Overstock x2 (i = 12, 13)
  for(let i=12; i<14; i++) {
    await prisma.product.update({ where: { sku: createdProducts[i].sku }, data: { currentStock: 200, targetCapacity: 100 } });
    notifs.push({ type: NotificationType.OVERSTOCK, severity: NotificationSeverity.INFO, title: 'Overstock Detected', msg: `${createdProducts[i].name} exceeds target capacity limits.`, sku: createdProducts[i].sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }

  // Dead Stock x2 (i = 14, 15)
  for(let i=14; i<16; i++) {
    // A product created 1 year ago with no recent movement is considered dead stock
    await prisma.product.update({ where: { sku: createdProducts[i].sku }, data: { currentStock: 50, createdAt: new Date(Date.now() - 365 * 86400000) } });
    notifs.push({ type: NotificationType.STOCK_VELOCITY, severity: NotificationSeverity.INFO, title: 'Dead Stock Warning', msg: `${createdProducts[i].name} has had zero sales in the last 45 days.`, sku: createdProducts[i].sku, users: [adminUser.id, managerUser.id, cashierUser.id] });
  }

  // Discount Approval (To Admin ONLY) x2 (i = 16, 17)
  for(let i=16; i<18; i++) {
    notifs.push({ type: NotificationType.DISCOUNT_APPROVAL, severity: NotificationSeverity.INFO, title: 'Discount Approval Required', msg: `Campaign for ${createdProducts[i].name} requires your approval.`, sku: createdProducts[i].sku, users: [adminUser.id] });
  }
  
  // Discount Response (To Manager ONLY) x2 (i = 18, 19)
  for(let i=18; i<20; i++) {
    notifs.push({ type: NotificationType.DISCOUNT_RESPONSE, severity: NotificationSeverity.INFO, title: 'Discount Approved', msg: `Admin approved your discount campaign for ${createdProducts[i].name}.`, sku: createdProducts[i].sku, users: [managerUser.id] });
  }

  for (const n of notifs) {
    await prisma.notification.create({
      data: {
        type: n.type, severity: n.severity, title: n.title, message: n.msg, sku: n.sku,
        userStates: { 
          create: n.users.map((uid: string) => ({ userId: uid }))
        }
      }
    });
  }

  // 8. Generate Sales Bills with full details
  console.log('🧾 Generating Sales Bills...');
  for (let i = 1; i <= 20; i++) {
    const numItems = Math.floor(Math.random() * 5) + 1;
    let subtotal = 0;
    const items = [];
    
    for (let j = 0; j < numItems; j++) {
      const p = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const total = p.sellingPrice * qty;
      subtotal += total;
      items.push({ sku: p.sku, qty, unitPrice: p.sellingPrice, total, discountValue: 0 });
    }

    const isCard = Math.random() > 0.5;
    const totalDiscount = Math.random() > 0.7 ? Math.floor(subtotal * 0.05) : 0;
    const totalBill = subtotal - totalDiscount;

    await prisma.bill.create({
      data: {
        billNumber: `INV-2026-${i.toString().padStart(4, '0')}`,
        cashierId: cashierUser.id,
        subtotal,
        totalDiscount,
        totalBill,
        paymentMethod: isCard ? PaymentMethod.CARD : PaymentMethod.CASH,
        totalQty: items.reduce((acc, curr) => acc + curr.qty, 0),
        draft: false,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000), // Random past 10 days
        billItems: { create: items }
      }
    });
  }

  console.log('✅ Seed completed successfully with distinct images, precise offers, and full details!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
