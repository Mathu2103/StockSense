import 'dotenv/config';
import { PrismaClient, BrandState, ProductStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// EAN-13 barcode generator with 479 (Sri Lanka) prefix
let barcodeSeq = 100000000;
function generateBarcode(): string {
  barcodeSeq++;
  const base = `479${barcodeSeq}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  return `${base}${check}`;
}

function makeSku(brand: string, product: string, size: string, seq: number): string {
  const b = brand.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const p = product.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const s = size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `${b}-${p}-${s}-${seq}`;
}

async function main() {
  console.log('🧹 Clearing inventory data (keeping users)...');
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.grnItem.deleteMany();
  await prisma.goodsReceivingNote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.masterProductClass.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.supplier.deleteMany();

  // ─── SUPPLIERS ──────────────────────────────────────────────────────────────
  console.log('📦 Seeding suppliers...');
  const suppliersRaw = [
    { name: 'Nestle Lanka',        companyName: 'Nestle Lanka PLC',                  email: 'orders@nestle.lk',        phone: '0112 696 696', address: 'Colombo 02, Sri Lanka' },
    { name: 'Elephant House',      companyName: 'Ceylon Cold Stores PLC',            email: 'trade@elephanthouse.lk',  phone: '0112 313 131', address: 'Colombo 02, Sri Lanka' },
    { name: 'Unilever SL',         companyName: 'Unilever Sri Lanka Ltd',            email: 'supply@unilever.lk',      phone: '0112 333 333', address: 'Colombo 14, Sri Lanka' },
    { name: 'CBL Group',           companyName: 'Ceylon Biscuits Limited',           email: 'orders@cbl.lk',           phone: '0112 858 585', address: 'Makumbura, Pannipitiya' },
    { name: 'Maliban',             companyName: 'Maliban Biscuit Manufactories',     email: 'trade@maliban.lk',        phone: '0112 737 373', address: 'Ratmalana, Sri Lanka' },
    { name: 'Fonterra Lanka',      companyName: 'Fonterra Brands Sri Lanka',         email: 'orders@fonterra.lk',      phone: '0112 484 848', address: 'Biyagama, Sri Lanka' },
    { name: 'Prima Ceylon',        companyName: 'Ceylon Agro Industries (Prima)',    email: 'trade@prima.lk',          phone: '0112 686 868', address: 'Rajagiriya, Sri Lanka' },
    { name: 'Hemas Consumer',      companyName: 'Hemas Consumer Brands Pvt Ltd',    email: 'orders@hemas.com',        phone: '0112 303 030', address: 'Colombo 02, Sri Lanka' },
    { name: 'Coca-Cola Lanka',     companyName: 'Coca-Cola Beverages Sri Lanka Ltd', email: 'trade@cocacola.lk',       phone: '0112 464 646', address: 'Biyagama, Sri Lanka' },
    { name: 'Cargills Quality',    companyName: 'Cargills Quality Foods Ltd',        email: 'supply@cargills.lk',      phone: '0112 424 242', address: 'Colombo 01, Sri Lanka' },
    { name: 'Delmege Forsyth',     companyName: 'Delmege Forsyth & Co. Ltd',         email: 'orders@delmege.lk',       phone: '0112 320 320', address: 'Colombo 10, Sri Lanka' },
    { name: 'Keells Food',         companyName: 'Keells Food Products PLC',          email: 'trade@keells.lk',         phone: '0112 490 490', address: 'Colombo 14, Sri Lanka' },
    { name: 'Sunshine Holdings',   companyName: 'Sunshine Holdings PLC',             email: 'orders@sunshine.lk',      phone: '0112 888 000', address: 'Colombo 03, Sri Lanka' },
    { name: 'Laugfs Consumer',     companyName: 'Laugfs Consumer Products Ltd',      email: 'supply@laugfs.lk',        phone: '0112 455 455', address: 'Colombo 10, Sri Lanka' },
    { name: 'Daelmans Lanka',      companyName: 'Daelmans Lanka Import Pvt Ltd',     email: 'trade@daelmans.lk',       phone: '0112 567 890', address: 'Colombo 01, Sri Lanka' },
    { name: 'Lanka Milk Foods',    companyName: 'Lanka Milk Foods (CWE) PLC',        email: 'orders@lmf.lk',           phone: '0112 233 344', address: 'Jaffna, Sri Lanka' },
    { name: 'Reckitt Lanka',       companyName: 'Reckitt Benckiser Lanka Ltd',       email: 'supply@reckitt.lk',       phone: '0112 599 599', address: 'Colombo 10, Sri Lanka' },
    { name: 'BOGO Lanka',          companyName: 'BOGO Lanka Pvt Ltd',                email: 'trade@bogolanka.lk',      phone: '0112 700 700', address: 'Gampaha, Sri Lanka' },
    { name: 'Verdo Lanka',         companyName: 'Verdo Lanka Distributors',          email: 'orders@verdo.lk',         phone: '0112 811 811', address: 'Kadawatha, Sri Lanka' },
    { name: 'Informatics Group',   companyName: 'Informatics Holdings Ltd',          email: 'trade@informatics.lk',    phone: '0112 900 900', address: 'Colombo 03, Sri Lanka' },
  ];
  const supplierMap: Record<string, any> = {};
  for (const s of suppliersRaw) {
    supplierMap[s.name] = await prisma.supplier.create({ data: s });
  }

  // ─── CATEGORIES + SUB-CATEGORIES ────────────────────────────────────────────
  console.log('📂 Seeding categories...');
  const categoriesRaw = [
    {
      name: 'Rice & Grains', description: 'All types of rice, flour, pulses and grains',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      subs: ['White Rice', 'Red Rice', 'Flour & Atta', 'Dhal & Lentils', 'Oats & Cereals']
    },
    {
      name: 'Cooking Oils & Ghee', description: 'Coconut oil, vegetable oil, ghee and related',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      subs: ['Coconut Oil', 'Vegetable Oil', 'Ghee & Butter Oil', 'Margarine']
    },
    {
      name: 'Sugar, Salt & Spices', description: 'Sweeteners, salt, and all spices',
      imageUrl: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&q=80',
      subs: ['Sugar', 'Salt', 'Curry Powders', 'Whole Spices', 'Pepper & Chili']
    },
    {
      name: 'Canned & Packaged Foods', description: 'Canned fish, canned veg, tinned goods',
      imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
      subs: ['Canned Fish', 'Canned Vegetables', 'Canned Fruits', 'Sauces & Pastes']
    },
    {
      name: 'Noodles & Pasta', description: 'Instant noodles, pasta and macaroni',
      imageUrl: 'https://images.unsplash.com/photo-1552056776-9b5657aca542?w=800&q=80',
      subs: ['Instant Noodles', 'Pasta & Macaroni', 'Vermicelli']
    },
    {
      name: 'Dairy & Eggs', description: 'Milk powder, fresh milk, yogurt, cheese and eggs',
      imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80',
      subs: ['Milk Powder', 'Fresh Milk', 'Yogurt & Curd', 'Cheese & Butter', 'Eggs']
    },
    {
      name: 'Beverages', description: 'Soft drinks, juices, water, tea and coffee',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80',
      subs: ['Soft Drinks', 'Fruit Juices', 'Water & Soda', 'Tea', 'Coffee', 'Malt & Energy Drinks']
    },
    {
      name: 'Snacks & Biscuits', description: 'Crackers, chips, cookies and biscuits',
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80',
      subs: ['Cream Crackers', 'Chocolate Biscuits', 'Wafers', 'Chips & Crisps', 'Nuts & Dried Fruits']
    },
    {
      name: 'Chocolates & Sweets', description: 'Chocolates, candy, toffee and confectionery',
      imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=80',
      subs: ['Chocolate Bars', 'Toffees & Candy', 'Lollipops', 'Jelly & Gum']
    },
    {
      name: 'Baby & Infant', description: 'Baby food, formula and infant accessories',
      imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
      subs: ['Infant Formula', 'Baby Food', 'Baby Care']
    },
    {
      name: 'Personal Care', description: 'Soap, shampoo, toothpaste and skincare',
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
      subs: ['Soap & Body Wash', 'Shampoo & Conditioner', 'Toothpaste & Mouthwash', 'Deodorants', 'Skincare & Lotion']
    },
    {
      name: 'Household Cleaning', description: 'Detergents, dishwash, floor cleaners and fresheners',
      imageUrl: 'https://images.unsplash.com/photo-1584820927508-ea24c30b2c15?w=800&q=80',
      subs: ['Laundry Detergent', 'Dishwashing', 'Floor & Toilet Cleaner', 'Air Freshener']
    },
    {
      name: 'Paper & Stationery', description: 'Tissue, toilet paper and stationery',
      imageUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&q=80',
      subs: ['Tissue Paper', 'Toilet Rolls', 'Notebooks & Pens']
    },
    {
      name: 'Health & Wellness', description: 'Vitamins, supplements and health foods',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      subs: ['Vitamins & Supplements', 'Health Drinks', 'First Aid']
    },
    {
      name: 'Frozen & Chilled Foods', description: 'Frozen meats, frozen veg and chilled ready meals',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      subs: ['Frozen Seafood', 'Frozen Poultry', 'Frozen Vegetables', 'Ice Cream']
    },
  ];

  const categoryMap: Record<string, any> = {};
  for (const c of categoriesRaw) {
    const cat = await prisma.category.create({
      data: { name: c.name, description: c.description, categoryImageUrl: c.imageUrl }
    });
    categoryMap[c.name] = cat;
    for (const sub of c.subs) {
      await prisma.subCategory.create({ data: { name: sub, categoryId: cat.id } });
    }
  }

  // ─── BRANDS ─────────────────────────────────────────────────────────────────
  console.log('🏷️ Seeding brands...');
  const brandsRaw = [
    // Food & Grocery
    { name: 'Maggi',         description: 'Nestle - Noodles, sauces and seasonings' },
    { name: 'Milo',          description: 'Nestle - Malt-based beverage' },
    { name: 'Nestomalt',     description: 'Nestle - Malt energy drink' },
    { name: 'Nescafe',       description: 'Nestle - Coffee products' },
    { name: 'KitKat',        description: 'Nestle - Chocolate wafer' },
    { name: 'Munch',         description: 'Nestle - Chocolate snack bar' },
    { name: 'Prima',         description: 'Prima - Flour, noodles and wheat products' },
    { name: 'Elephant House',description: 'Ceylon Cold Stores - Iconic Sri Lankan beverages' },
    { name: 'Anchor',        description: 'Fonterra - Dairy products' },
    { name: 'Highland',      description: 'Lanka Milk Foods - Fresh dairy' },
    { name: 'Munchee',       description: 'CBL - Biscuits and crackers' },
    { name: 'Ritzbury',      description: 'CBL - Chocolates and confectionery' },
    { name: 'Cherries',      description: 'CBL - Cream biscuits' },
    { name: 'Maliban',       description: 'Maliban - Biscuits' },
    { name: 'Sera',          description: 'Cargills - Ice cream' },
    { name: 'Cargills',      description: 'Cargills - Food products' },
    { name: 'Keells',        description: 'Keells - Processed meats and foods' },
    { name: 'Eco Spirit',    description: 'Laugfs - Cooking oils' },
    { name: 'Sunflower',     description: 'Sunshine - Cooking oil' },
    { name: 'Araliya',       description: 'Delmege - Premium Basmati rice' },
    { name: 'Sathosa',       description: 'Sathosa - Government branded staples' },
    { name: 'Samagi',        description: 'Local - Rice and staples' },
    { name: 'Larich',        description: 'Sunshine - Milk powder' },
    { name: 'Lakspray',      description: 'Lanka Milk Foods - Milk powder' },
    // Beverages
    { name: 'Coca-Cola',     description: 'Coca-Cola - Carbonated beverages' },
    { name: 'Sprite',        description: 'Coca-Cola - Lemon-lime soda' },
    { name: 'Fanta',         description: 'Coca-Cola - Fruit flavored soda' },
    { name: 'Lion',          description: 'Ceylon Brewery - Beer and malt' },
    { name: 'Sunquick',      description: 'Danish - Concentrated juice' },
    { name: 'Nestea',        description: 'Nestle - Iced tea' },
    // Personal Care
    { name: 'Lifebuoy',      description: 'Unilever - Antibacterial soap' },
    { name: 'Lux',           description: 'Unilever - Beauty soap' },
    { name: 'Dove',          description: 'Unilever - Moisturizing soap and shampoo' },
    { name: 'Sunsilk',       description: 'Unilever - Hair care' },
    { name: 'Clear',         description: 'Unilever - Anti-dandruff shampoo' },
    { name: 'Signal',        description: 'Unilever - Toothpaste' },
    { name: 'Clogard',       description: 'Hemas - Toothpaste' },
    { name: 'Pepsodent',     description: 'Unilever - Toothpaste' },
    { name: 'Vaseline',      description: 'Unilever - Skincare' },
    { name: 'Fair & Lovely', description: 'Unilever - Skin cream' },
    { name: 'Baby Cheramy',  description: 'Hemas - Baby care' },
    { name: 'Cusson',        description: 'PZ Cussons - Baby care' },
    // Cleaning
    { name: 'Sunlight',      description: 'Unilever - Dishwashing and laundry' },
    { name: 'Surf Excel',    description: 'Unilever - Laundry detergent' },
    { name: 'Rin',           description: 'Unilever - Laundry powder' },
    { name: 'Vim',           description: 'Unilever - Dishwash paste and liquid' },
    { name: 'Harpic',        description: 'Reckitt - Toilet cleaner' },
    { name: 'Dettol',        description: 'Reckitt - Antibacterial products' },
    { name: 'Mortein',       description: 'Reckitt - Insect repellent' },
    { name: 'Air Wick',      description: 'Reckitt - Air freshener' },
    // Health
    { name: 'Sustagen',      description: 'Nestle - Nutritional supplement' },
    { name: 'Ensure',        description: 'Abbott - Adult nutrition' },
    { name: 'Zesta',         description: 'Sunshine - Tea' },
    { name: 'Dilmah',        description: 'Dilmah - Premium Ceylon Tea' },
    { name: 'Lipton',        description: 'Unilever - Tea bags' },
  ];

  const brandMap: Record<string, any> = {};
  for (const b of brandsRaw) {
    brandMap[b.name] = await prisma.brand.create({ data: { name: b.name, description: b.description, state: BrandState.ACTIVE } });
  }

  // ─── PRODUCTS ────────────────────────────────────────────────────────────────
  console.log('🛒 Generating products...');

  let totalSkus = 0;

  // Helper: create master + variants
  async function createProduct(
    masterName: string,
    categoryName: string,
    brandName: string,
    supplierName: string,
    imageUrl: string,
    variants: { size: string; costPrice: number; sellingPrice: number; stock: number; discount?: number }[]
  ) {
    const cat = categoryMap[categoryName];
    const brand = brandMap[brandName];
    const supplier = supplierMap[supplierName];
    if (!cat || !brand || !supplier) {
      console.warn(`Skipping "${masterName}" — missing cat/brand/supplier`);
      return;
    }
    const master = await prisma.masterProductClass.create({
      data: { name: masterName, categoryId: cat.id, brandId: brand.id, supplierId: supplier.id, hasVariant: variants.length > 1 }
    });
    const rows = variants.map(v => {
      totalSkus++;
      return {
        sku: makeSku(brandName, masterName, v.size, totalSkus),
        masterId: master.id,
        barcode: generateBarcode(),
        name: `${masterName} ${v.size}`,
        unitType: v.size.toLowerCase().match(/kg|g/) ? 'Weight' : v.size.toLowerCase().match(/l|ml/) ? 'Volume' : 'Piece',
        costPrice: v.costPrice,
        sellingPrice: v.sellingPrice,
        discount: v.discount ?? 0,
        currentStock: v.stock,
        reorderLevel: 20,
        targetCapacity: 300,
        status: ProductStatus.ACTIVE,
        imageUrl,
        variantAttributeType: v.size,
      };
    });
    await prisma.product.createMany({ data: rows });
  }

  // ─── RICE & GRAINS ──────────────────────────────────────────
  const riceImg = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80';
  const flourImg = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80';
  const dhalImg  = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80';
  const oatsImg  = 'https://images.unsplash.com/photo-1614961233913-a5113a7f4a94?w=800&q=80';

  await createProduct('Araliya White Raw Rice', 'Rice & Grains', 'Araliya', 'Delmege Forsyth', riceImg, [
    { size: '1kg', costPrice: 230, sellingPrice: 270, stock: 180 },
    { size: '5kg', costPrice: 1050, sellingPrice: 1250, stock: 120 },
    { size: '10kg', costPrice: 2050, sellingPrice: 2450, stock: 60 },
  ]);
  await createProduct('Araliya Red Kekulu Rice', 'Rice & Grains', 'Araliya', 'Delmege Forsyth', riceImg, [
    { size: '1kg', costPrice: 250, sellingPrice: 295, stock: 150 },
    { size: '5kg', costPrice: 1150, sellingPrice: 1370, stock: 100 },
  ]);
  await createProduct('Araliya Basmati Rice', 'Rice & Grains', 'Araliya', 'Delmege Forsyth', riceImg, [
    { size: '1kg', costPrice: 490, sellingPrice: 580, stock: 80 },
    { size: '5kg', costPrice: 2350, sellingPrice: 2790, stock: 40 },
  ]);
  await createProduct('Sathosa White Rice', 'Rice & Grains', 'Sathosa', 'Cargills Quality', riceImg, [
    { size: '5kg', costPrice: 980, sellingPrice: 1150, stock: 200 },
    { size: '10kg', costPrice: 1900, sellingPrice: 2250, stock: 100 },
  ]);
  await createProduct('Samagi Red Rice', 'Rice & Grains', 'Samagi', 'Cargills Quality', riceImg, [
    { size: '1kg', costPrice: 240, sellingPrice: 280, stock: 160 },
    { size: '5kg', costPrice: 1100, sellingPrice: 1300, stock: 90 },
  ]);
  await createProduct('Prima Wheat Flour', 'Rice & Grains', 'Prima', 'Prima Ceylon', flourImg, [
    { size: '1kg', costPrice: 220, sellingPrice: 260, stock: 200 },
    { size: '2kg', costPrice: 420, sellingPrice: 500, stock: 120 },
    { size: '5kg', costPrice: 1000, sellingPrice: 1200, stock: 80 },
  ]);
  await createProduct('Prima String Hoppers Flour', 'Rice & Grains', 'Prima', 'Prima Ceylon', flourImg, [
    { size: '400g', costPrice: 95, sellingPrice: 115, stock: 150 },
    { size: '1kg', costPrice: 210, sellingPrice: 250, stock: 100 },
  ]);
  await createProduct('Sunflower Dhal Red', 'Rice & Grains', 'Sunflower', 'Sunshine Holdings', dhalImg, [
    { size: '500g', costPrice: 185, sellingPrice: 220, stock: 180 },
    { size: '1kg', costPrice: 360, sellingPrice: 430, stock: 120 },
  ]);
  await createProduct('Sunflower Chickpeas', 'Rice & Grains', 'Sunflower', 'Sunshine Holdings', dhalImg, [
    { size: '500g', costPrice: 175, sellingPrice: 210, stock: 150 },
    { size: '1kg', costPrice: 340, sellingPrice: 410, stock: 90 },
  ]);
  await createProduct('Maggi Oats', 'Rice & Grains', 'Maggi', 'Nestle Lanka', oatsImg, [
    { size: '400g', costPrice: 220, sellingPrice: 265, stock: 120 },
    { size: '800g', costPrice: 420, sellingPrice: 500, stock: 80 },
  ]);
  await createProduct('Nestomalt Cereal', 'Rice & Grains', 'Nestomalt', 'Nestle Lanka', oatsImg, [
    { size: '200g', costPrice: 145, sellingPrice: 175, stock: 100 },
    { size: '400g', costPrice: 280, sellingPrice: 335, stock: 70 },
  ]);

  // ─── COOKING OILS ──────────────────────────────────────────
  const oilImg = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80';
  await createProduct('Eco Spirit Coconut Oil', 'Cooking Oils & Ghee', 'Eco Spirit', 'Laugfs Consumer', oilImg, [
    { size: '500ml', costPrice: 320, sellingPrice: 385, stock: 150 },
    { size: '1L', costPrice: 610, sellingPrice: 730, stock: 100 },
    { size: '2L', costPrice: 1180, sellingPrice: 1400, stock: 60 },
  ]);
  await createProduct('Sunflower Vegetable Oil', 'Cooking Oils & Ghee', 'Sunflower', 'Sunshine Holdings', oilImg, [
    { size: '500ml', costPrice: 245, sellingPrice: 295, stock: 160 },
    { size: '1L', costPrice: 470, sellingPrice: 565, stock: 110 },
    { size: '2L', costPrice: 900, sellingPrice: 1080, stock: 70 },
  ]);
  await createProduct('Anchor Butter', 'Cooking Oils & Ghee', 'Anchor', 'Fonterra Lanka', oilImg, [
    { size: '100g', costPrice: 195, sellingPrice: 235, stock: 120 },
    { size: '250g', costPrice: 470, sellingPrice: 565, stock: 80 },
    { size: '500g', costPrice: 920, sellingPrice: 1100, stock: 50 },
  ]);
  await createProduct('Highland Margarine', 'Cooking Oils & Ghee', 'Highland', 'Lanka Milk Foods', oilImg, [
    { size: '200g', costPrice: 145, sellingPrice: 175, stock: 130 },
    { size: '500g', costPrice: 340, sellingPrice: 410, stock: 80 },
  ]);

  // ─── SUGAR, SALT & SPICES ──────────────────────────────────
  const sugarImg = 'https://images.unsplash.com/photo-1558642451-3a83f87e8c7f?w=800&q=80';
  const spiceImg = 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&q=80';
  await createProduct('Sathosa White Sugar', 'Sugar, Salt & Spices', 'Sathosa', 'Cargills Quality', sugarImg, [
    { size: '500g', costPrice: 155, sellingPrice: 185, stock: 250 },
    { size: '1kg', costPrice: 295, sellingPrice: 355, stock: 200 },
    { size: '2kg', costPrice: 575, sellingPrice: 690, stock: 100 },
  ]);
  await createProduct('Sathosa Salt', 'Sugar, Salt & Spices', 'Sathosa', 'Cargills Quality', spiceImg, [
    { size: '500g', costPrice: 55, sellingPrice: 70, stock: 300 },
    { size: '1kg', costPrice: 100, sellingPrice: 125, stock: 200 },
  ]);
  await createProduct('Maggi Curry Powder', 'Sugar, Salt & Spices', 'Maggi', 'Nestle Lanka', spiceImg, [
    { size: '100g', costPrice: 115, sellingPrice: 140, stock: 180 },
    { size: '250g', costPrice: 270, sellingPrice: 325, stock: 120 },
    { size: '500g', costPrice: 520, sellingPrice: 625, stock: 70 },
  ]);
  await createProduct('Sathosa Chili Powder', 'Sugar, Salt & Spices', 'Sathosa', 'Cargills Quality', spiceImg, [
    { size: '100g', costPrice: 125, sellingPrice: 150, stock: 160 },
    { size: '250g', costPrice: 295, sellingPrice: 355, stock: 100 },
  ]);
  await createProduct('Sathosa Turmeric Powder', 'Sugar, Salt & Spices', 'Sathosa', 'Cargills Quality', spiceImg, [
    { size: '100g', costPrice: 95, sellingPrice: 115, stock: 200 },
    { size: '200g', costPrice: 180, sellingPrice: 215, stock: 120 },
  ]);
  await createProduct('Maggi Black Pepper', 'Sugar, Salt & Spices', 'Maggi', 'Nestle Lanka', spiceImg, [
    { size: '50g', costPrice: 145, sellingPrice: 175, stock: 150 },
    { size: '100g', costPrice: 275, sellingPrice: 330, stock: 90 },
  ]);

  // ─── CANNED & PACKAGED FOODS ───────────────────────────────
  const cannedImg = 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80';
  const sauceImg  = 'https://images.unsplash.com/photo-1606574977849-00bc01799b14?w=800&q=80';
  await createProduct('Maggi Canned Mackerel', 'Canned & Packaged Foods', 'Maggi', 'Nestle Lanka', cannedImg, [
    { size: '185g', costPrice: 245, sellingPrice: 295, stock: 200 },
    { size: '400g', costPrice: 520, sellingPrice: 625, stock: 100 },
  ]);
  await createProduct('Keells Canned Tuna', 'Canned & Packaged Foods', 'Keells', 'Keells Food', cannedImg, [
    { size: '185g', costPrice: 265, sellingPrice: 320, stock: 180 },
    { size: '400g', costPrice: 550, sellingPrice: 660, stock: 90 },
  ]);
  await createProduct('Sathosa Canned Chickpeas', 'Canned & Packaged Foods', 'Sathosa', 'Cargills Quality', cannedImg, [
    { size: '400g', costPrice: 175, sellingPrice: 210, stock: 150 },
  ]);
  await createProduct('Maggi Tomato Sauce', 'Canned & Packaged Foods', 'Maggi', 'Nestle Lanka', sauceImg, [
    { size: '325g', costPrice: 155, sellingPrice: 190, stock: 180 },
    { size: '500g', costPrice: 225, sellingPrice: 270, stock: 120 },
  ]);
  await createProduct('Maggi Chili Sauce', 'Canned & Packaged Foods', 'Maggi', 'Nestle Lanka', sauceImg, [
    { size: '340g', costPrice: 165, sellingPrice: 200, stock: 150 },
  ]);
  await createProduct('Maggi Soya Sauce', 'Canned & Packaged Foods', 'Maggi', 'Nestle Lanka', sauceImg, [
    { size: '150ml', costPrice: 115, sellingPrice: 140, stock: 160 },
    { size: '300ml', costPrice: 210, sellingPrice: 255, stock: 90 },
  ]);

  // ─── NOODLES & PASTA ───────────────────────────────────────
  const noodleImg = 'https://images.unsplash.com/photo-1552056776-9b5657aca542?w=800&q=80';
  await createProduct('Maggi 2-Minute Noodles Chicken', 'Noodles & Pasta', 'Maggi', 'Nestle Lanka', noodleImg, [
    { size: '77g Single', costPrice: 60, sellingPrice: 75, stock: 400 },
    { size: '4-Pack', costPrice: 235, sellingPrice: 285, stock: 200 },
    { size: '8-Pack', costPrice: 460, sellingPrice: 555, stock: 100 },
  ]);
  await createProduct('Maggi 2-Minute Noodles Masala', 'Noodles & Pasta', 'Maggi', 'Nestle Lanka', noodleImg, [
    { size: '77g Single', costPrice: 60, sellingPrice: 75, stock: 350 },
    { size: '4-Pack', costPrice: 235, sellingPrice: 285, stock: 180 },
  ]);
  await createProduct('Prima Noodles Vegetable', 'Noodles & Pasta', 'Prima', 'Prima Ceylon', noodleImg, [
    { size: '80g Single', costPrice: 55, sellingPrice: 68, stock: 380 },
    { size: '4-Pack', costPrice: 215, sellingPrice: 260, stock: 180 },
  ]);
  await createProduct('Prima Pasta Penne', 'Noodles & Pasta', 'Prima', 'Prima Ceylon', noodleImg, [
    { size: '400g', costPrice: 155, sellingPrice: 190, stock: 150 },
  ]);
  await createProduct('Prima Spaghetti', 'Noodles & Pasta', 'Prima', 'Prima Ceylon', noodleImg, [
    { size: '400g', costPrice: 155, sellingPrice: 190, stock: 130 },
  ]);

  // ─── DAIRY & EGGS ──────────────────────────────────────────
  const milkImg   = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80';
  const yogurtImg = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80';
  await createProduct('Anchor Milk Powder Full Cream', 'Dairy & Eggs', 'Anchor', 'Fonterra Lanka', milkImg, [
    { size: '200g', costPrice: 295, sellingPrice: 355, stock: 180 },
    { size: '400g', costPrice: 570, sellingPrice: 685, stock: 120 },
    { size: '1kg', costPrice: 1350, sellingPrice: 1620, stock: 60 },
    { size: '2.5kg', costPrice: 3200, sellingPrice: 3840, stock: 30 },
  ]);
  await createProduct('Anchor Milk Powder Low Fat', 'Dairy & Eggs', 'Anchor', 'Fonterra Lanka', milkImg, [
    { size: '400g', costPrice: 600, sellingPrice: 720, stock: 100 },
    { size: '1kg', costPrice: 1420, sellingPrice: 1705, stock: 50 },
  ]);
  await createProduct('Lakspray Full Cream Milk Powder', 'Dairy & Eggs', 'Lakspray', 'Lanka Milk Foods', milkImg, [
    { size: '200g', costPrice: 275, sellingPrice: 330, stock: 160 },
    { size: '400g', costPrice: 530, sellingPrice: 635, stock: 110 },
    { size: '1kg', costPrice: 1280, sellingPrice: 1535, stock: 55 },
  ]);
  await createProduct('Larich Full Cream Milk', 'Dairy & Eggs', 'Larich', 'Lanka Milk Foods', milkImg, [
    { size: '400g', costPrice: 545, sellingPrice: 655, stock: 130 },
    { size: '1kg', costPrice: 1300, sellingPrice: 1560, stock: 65 },
  ]);
  await createProduct('Highland Fresh Milk', 'Dairy & Eggs', 'Highland', 'Lanka Milk Foods', milkImg, [
    { size: '500ml', costPrice: 120, sellingPrice: 145, stock: 150 },
    { size: '1L', costPrice: 230, sellingPrice: 275, stock: 100 },
  ]);
  await createProduct('Anchor Cheddar Cheese', 'Dairy & Eggs', 'Anchor', 'Fonterra Lanka', yogurtImg, [
    { size: '200g', costPrice: 570, sellingPrice: 685, stock: 80 },
  ]);
  await createProduct('Highland Yogurt Plain', 'Dairy & Eggs', 'Highland', 'Lanka Milk Foods', yogurtImg, [
    { size: '200g', costPrice: 95, sellingPrice: 115, stock: 200 },
    { size: '400g', costPrice: 175, sellingPrice: 210, stock: 120 },
  ]);
  await createProduct('Highland Yogurt Fruit Mix', 'Dairy & Eggs', 'Highland', 'Lanka Milk Foods', yogurtImg, [
    { size: '100g', costPrice: 65, sellingPrice: 80, stock: 200 },
    { size: '200g', costPrice: 120, sellingPrice: 145, stock: 130 },
  ]);
  await createProduct('Sustagen Junior', 'Dairy & Eggs', 'Sustagen', 'Nestle Lanka', milkImg, [
    { size: '400g', costPrice: 920, sellingPrice: 1105, stock: 80 },
    { size: '900g', costPrice: 1980, sellingPrice: 2375, stock: 45 },
  ]);
  await createProduct('Milo Powder', 'Dairy & Eggs', 'Milo', 'Nestle Lanka', milkImg, [
    { size: '200g', costPrice: 295, sellingPrice: 355, stock: 200 },
    { size: '400g', costPrice: 565, sellingPrice: 680, stock: 130 },
    { size: '1kg', costPrice: 1330, sellingPrice: 1595, stock: 60 },
  ]);

  // ─── BEVERAGES ─────────────────────────────────────────────
  const softDrinkImg = 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80';
  const juiceImg     = 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80';
  const teaImg       = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80';
  const coffeeImg    = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80';
  const waterImg     = 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80';

  for (const flavor of ['Cream Soda', 'Ginger Beer', 'Necto', 'Plain Soda', 'Lemon Crush', 'Apple Crush']) {
    await createProduct(`Elephant House ${flavor}`, 'Beverages', 'Elephant House', 'Elephant House', softDrinkImg, [
      { size: '330ml Can', costPrice: 90, sellingPrice: 110, stock: 300 },
      { size: '500ml Bottle', costPrice: 105, sellingPrice: 130, stock: 200 },
      { size: '1.5L Bottle', costPrice: 195, sellingPrice: 235, stock: 120 },
    ]);
  }
  for (const flavor of ['Cola', 'Lemon & Lime', 'Orange']) {
    await createProduct(`Coca-Cola ${flavor}`, 'Beverages', 'Coca-Cola', 'Coca-Cola Lanka', softDrinkImg, [
      { size: '250ml Can', costPrice: 110, sellingPrice: 135, stock: 250 },
      { size: '330ml Can', costPrice: 130, sellingPrice: 160, stock: 220 },
      { size: '500ml Bottle', costPrice: 155, sellingPrice: 190, stock: 180 },
      { size: '1.5L Bottle', costPrice: 250, sellingPrice: 300, stock: 100 },
    ]);
  }
  await createProduct('Sprite', 'Beverages', 'Sprite', 'Coca-Cola Lanka', softDrinkImg, [
    { size: '330ml Can', costPrice: 130, sellingPrice: 160, stock: 200 },
    { size: '1.5L Bottle', costPrice: 248, sellingPrice: 298, stock: 100 },
  ]);
  await createProduct('Fanta Orange', 'Beverages', 'Fanta', 'Coca-Cola Lanka', softDrinkImg, [
    { size: '330ml Can', costPrice: 130, sellingPrice: 160, stock: 200 },
    { size: '1.5L Bottle', costPrice: 248, sellingPrice: 298, stock: 100 },
  ]);
  await createProduct('Sunquick Orange Concentrate', 'Beverages', 'Sunquick', 'Delmege Forsyth', juiceImg, [
    { size: '330ml', costPrice: 295, sellingPrice: 355, stock: 120 },
    { size: '700ml', costPrice: 595, sellingPrice: 715, stock: 70 },
  ]);
  await createProduct('Sunquick Mixed Fruit', 'Beverages', 'Sunquick', 'Delmege Forsyth', juiceImg, [
    { size: '330ml', costPrice: 295, sellingPrice: 355, stock: 110 },
  ]);
  await createProduct('Dilmah Green Tea', 'Beverages', 'Dilmah', 'Sunshine Holdings', teaImg, [
    { size: '20 Bags', costPrice: 155, sellingPrice: 190, stock: 200 },
    { size: '50 Bags', costPrice: 360, sellingPrice: 435, stock: 120 },
    { size: '100 Bags', costPrice: 680, sellingPrice: 815, stock: 70 },
  ]);
  await createProduct('Dilmah Ceylon Tea', 'Beverages', 'Dilmah', 'Sunshine Holdings', teaImg, [
    { size: '50 Bags', costPrice: 295, sellingPrice: 355, stock: 180 },
    { size: '100 Bags', costPrice: 560, sellingPrice: 670, stock: 100 },
  ]);
  await createProduct('Zesta Ceylon Tea', 'Beverages', 'Zesta', 'Sunshine Holdings', teaImg, [
    { size: '100g', costPrice: 155, sellingPrice: 190, stock: 200 },
    { size: '200g', costPrice: 295, sellingPrice: 355, stock: 130 },
    { size: '500g', costPrice: 710, sellingPrice: 850, stock: 70 },
  ]);
  await createProduct('Lipton Yellow Label Tea', 'Beverages', 'Lipton', 'Unilever SL', teaImg, [
    { size: '50 Bags', costPrice: 280, sellingPrice: 336, stock: 150 },
    { size: '100 Bags', costPrice: 530, sellingPrice: 635, stock: 90 },
  ]);
  await createProduct('Nescafe Classic', 'Beverages', 'Nescafe', 'Nestle Lanka', coffeeImg, [
    { size: '50g', costPrice: 355, sellingPrice: 430, stock: 120 },
    { size: '100g', costPrice: 695, sellingPrice: 835, stock: 80 },
    { size: '200g', costPrice: 1350, sellingPrice: 1620, stock: 45 },
  ]);
  await createProduct('Nescafe Gold', 'Beverages', 'Nescafe', 'Nestle Lanka', coffeeImg, [
    { size: '50g', costPrice: 475, sellingPrice: 570, stock: 100 },
    { size: '100g', costPrice: 930, sellingPrice: 1115, stock: 60 },
  ]);
  await createProduct('Nestea Iced Tea Lemon', 'Beverages', 'Nestea', 'Nestle Lanka', teaImg, [
    { size: '230ml', costPrice: 90, sellingPrice: 110, stock: 200 },
  ]);
  await createProduct('Pure Life Mineral Water', 'Beverages', 'Nestomalt', 'Nestle Lanka', waterImg, [
    { size: '500ml', costPrice: 45, sellingPrice: 60, stock: 400 },
    { size: '1L', costPrice: 65, sellingPrice: 85, stock: 300 },
    { size: '1.5L', costPrice: 85, sellingPrice: 110, stock: 200 },
  ]);
  await createProduct('Milo Ready to Drink', 'Beverages', 'Milo', 'Nestle Lanka', softDrinkImg, [
    { size: '180ml', costPrice: 85, sellingPrice: 105, stock: 250 },
    { size: '250ml', costPrice: 115, sellingPrice: 140, stock: 180 },
  ]);

  // ─── SNACKS & BISCUITS ─────────────────────────────────────
  const biscuitImg = 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80';
  const chipsImg   = 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80';
  const nutsImg    = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80';

  for (const variant of ['Cream Cracker', 'Marie', 'Lemon Puff', 'Chocolate Cream', 'Milk Short Cake', 'Coconut Biscuit', 'Ginger Biscuit', 'Vanilla Puff']) {
    await createProduct(`Munchee ${variant}`, 'Snacks & Biscuits', 'Munchee', 'CBL Group', biscuitImg, [
      { size: '100g', costPrice: 75, sellingPrice: 92, stock: 300 },
      { size: '200g', costPrice: 140, sellingPrice: 170, stock: 200 },
      { size: '400g', costPrice: 270, sellingPrice: 325, stock: 120 },
    ]);
  }
  for (const variant of ['Cream Cracker', 'Marie', 'Lemon Puff', 'Glucose', 'Digestive', 'Butter Puff']) {
    await createProduct(`Maliban ${variant}`, 'Snacks & Biscuits', 'Maliban', 'Maliban', biscuitImg, [
      { size: '100g', costPrice: 70, sellingPrice: 86, stock: 280 },
      { size: '200g', costPrice: 130, sellingPrice: 158, stock: 190 },
    ]);
  }
  for (const flavor of ['Original', 'Salt & Vinegar', 'BBQ', 'Cheese']) {
    await createProduct(`Cargills Chips ${flavor}`, 'Snacks & Biscuits', 'Cargills', 'Cargills Quality', chipsImg, [
      { size: '25g', costPrice: 45, sellingPrice: 58, stock: 350 },
      { size: '75g', costPrice: 120, sellingPrice: 148, stock: 200 },
    ]);
  }
  await createProduct('Munchee Super Cream Cracker', 'Snacks & Biscuits', 'Munchee', 'CBL Group', biscuitImg, [
    { size: '190g', costPrice: 145, sellingPrice: 175, stock: 250 },
  ]);
  await createProduct('Ritzbury Almond Chocolate', 'Snacks & Biscuits', 'Ritzbury', 'CBL Group', biscuitImg, [
    { size: '150g', costPrice: 275, sellingPrice: 330, stock: 150 },
  ]);
  await createProduct('Ritzbury Milk Chocolate Bar', 'Snacks & Biscuits', 'Ritzbury', 'CBL Group', biscuitImg, [
    { size: '25g', costPrice: 60, sellingPrice: 75, stock: 400 },
    { size: '100g', costPrice: 215, sellingPrice: 260, stock: 200 },
  ]);
  await createProduct('KitKat Chocolate', 'Snacks & Biscuits', 'KitKat', 'Nestle Lanka', biscuitImg, [
    { size: '17g Single', costPrice: 95, sellingPrice: 115, stock: 350 },
    { size: '40g', costPrice: 210, sellingPrice: 255, stock: 200 },
  ]);
  await createProduct('Munch Chocolate Bar', 'Snacks & Biscuits', 'Munch', 'Nestle Lanka', biscuitImg, [
    { size: '13.5g', costPrice: 40, sellingPrice: 50, stock: 400 },
  ]);
  await createProduct('Sathosa Mixed Nuts', 'Snacks & Biscuits', 'Sathosa', 'Cargills Quality', nutsImg, [
    { size: '100g', costPrice: 195, sellingPrice: 235, stock: 150 },
    { size: '200g', costPrice: 375, sellingPrice: 450, stock: 90 },
  ]);
  await createProduct('Sathosa Cashew Nuts', 'Snacks & Biscuits', 'Sathosa', 'Cargills Quality', nutsImg, [
    { size: '100g', costPrice: 420, sellingPrice: 505, stock: 100 },
    { size: '250g', costPrice: 990, sellingPrice: 1190, stock: 50 },
  ]);

  // ─── CHOCOLATES & SWEETS ───────────────────────────────────
  const chocoImg = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=80';
  await createProduct('Ritzbury Dark Chocolate', 'Chocolates & Sweets', 'Ritzbury', 'CBL Group', chocoImg, [
    { size: '50g', costPrice: 145, sellingPrice: 175, stock: 200 },
    { size: '150g', costPrice: 395, sellingPrice: 475, stock: 100 },
  ]);
  await createProduct('Ritzbury White Chocolate', 'Chocolates & Sweets', 'Ritzbury', 'CBL Group', chocoImg, [
    { size: '50g', costPrice: 145, sellingPrice: 175, stock: 180 },
    { size: '150g', costPrice: 395, sellingPrice: 475, stock: 90 },
  ]);
  await createProduct('Cherries Toffee', 'Chocolates & Sweets', 'Cherries', 'CBL Group', chocoImg, [
    { size: '100g', costPrice: 115, sellingPrice: 140, stock: 250 },
    { size: '200g', costPrice: 220, sellingPrice: 265, stock: 150 },
  ]);
  await createProduct('KitKat Chunky', 'Chocolates & Sweets', 'KitKat', 'Nestle Lanka', chocoImg, [
    { size: '38g', costPrice: 175, sellingPrice: 210, stock: 200 },
  ]);

  // ─── BABY & INFANT ─────────────────────────────────────────
  const babyImg = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80';
  await createProduct('Nestogen Follow-On Formula', 'Baby & Infant', 'Nestomalt', 'Nestle Lanka', babyImg, [
    { size: '400g', costPrice: 1450, sellingPrice: 1740, stock: 60 },
    { size: '800g', costPrice: 2750, sellingPrice: 3300, stock: 35 },
  ]);
  await createProduct('Sustagen Kids Vanilla', 'Baby & Infant', 'Sustagen', 'Nestle Lanka', babyImg, [
    { size: '400g', costPrice: 1650, sellingPrice: 1980, stock: 55 },
    { size: '900g', costPrice: 3500, sellingPrice: 4200, stock: 28 },
  ]);
  await createProduct('Baby Cheramy Powder', 'Baby & Infant', 'Baby Cheramy', 'Hemas Consumer', babyImg, [
    { size: '100g', costPrice: 245, sellingPrice: 295, stock: 100 },
    { size: '200g', costPrice: 465, sellingPrice: 560, stock: 60 },
  ]);
  await createProduct('Baby Cheramy Soap', 'Baby & Infant', 'Baby Cheramy', 'Hemas Consumer', babyImg, [
    { size: '75g', costPrice: 115, sellingPrice: 140, stock: 150 },
  ]);

  // ─── PERSONAL CARE ─────────────────────────────────────────
  const soapImg      = 'https://images.unsplash.com/photo-1603204077779-bed963ea7d0e?w=800&q=80';
  const shampooImg   = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80';
  const toothImg     = 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80';
  const skinImg      = 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80';

  for (const variant of ['Original', 'Lemon Fresh', 'Aloe Vera', 'Milk & Honey']) {
    await createProduct(`Lifebuoy Soap ${variant}`, 'Personal Care', 'Lifebuoy', 'Unilever SL', soapImg, [
      { size: '90g', costPrice: 115, sellingPrice: 140, stock: 300 },
      { size: '3-Pack', costPrice: 325, sellingPrice: 392, stock: 150 },
    ]);
  }
  for (const variant of ['Rose', 'Jasmine', 'Orchid', 'Aqua']) {
    await createProduct(`Lux Soap ${variant}`, 'Personal Care', 'Lux', 'Unilever SL', soapImg, [
      { size: '90g', costPrice: 130, sellingPrice: 158, stock: 280 },
      { size: '3-Pack', costPrice: 365, sellingPrice: 440, stock: 140 },
    ]);
  }
  await createProduct('Dove Beauty Bar', 'Personal Care', 'Dove', 'Unilever SL', soapImg, [
    { size: '100g', costPrice: 195, sellingPrice: 235, stock: 200 },
    { size: '3-Pack', costPrice: 555, sellingPrice: 665, stock: 90 },
  ]);
  for (const variant of ['Black Shine', 'Soft & Smooth', 'Anti-Dandruff', 'Hairfall Solution']) {
    await createProduct(`Sunsilk Shampoo ${variant}`, 'Personal Care', 'Sunsilk', 'Unilever SL', shampooImg, [
      { size: '160ml', costPrice: 195, sellingPrice: 235, stock: 200 },
      { size: '340ml', costPrice: 385, sellingPrice: 465, stock: 120 },
      { size: '700ml', costPrice: 745, sellingPrice: 895, stock: 60 },
    ]);
  }
  for (const variant of ['Pure', 'Anti-Dandruff', 'Cool Menthol']) {
    await createProduct(`Clear Shampoo ${variant}`, 'Personal Care', 'Clear', 'Unilever SL', shampooImg, [
      { size: '160ml', costPrice: 210, sellingPrice: 255, stock: 180 },
      { size: '340ml', costPrice: 400, sellingPrice: 480, stock: 100 },
    ]);
  }
  await createProduct('Dove Shampoo Nourishing', 'Personal Care', 'Dove', 'Unilever SL', shampooImg, [
    { size: '180ml', costPrice: 270, sellingPrice: 325, stock: 150 },
    { size: '340ml', costPrice: 490, sellingPrice: 590, stock: 90 },
  ]);
  for (const variant of ['White', 'Herbal', 'Charcoal', 'Kids']) {
    await createProduct(`Signal Toothpaste ${variant}`, 'Personal Care', 'Signal', 'Unilever SL', toothImg, [
      { size: '75ml', costPrice: 115, sellingPrice: 140, stock: 250 },
      { size: '150ml', costPrice: 210, sellingPrice: 255, stock: 160 },
    ]);
  }
  for (const variant of ['Original', 'Herbal', 'Salt', 'Sensitive']) {
    await createProduct(`Clogard Toothpaste ${variant}`, 'Personal Care', 'Clogard', 'Hemas Consumer', toothImg, [
      { size: '80ml', costPrice: 105, sellingPrice: 128, stock: 230 },
      { size: '160ml', costPrice: 195, sellingPrice: 235, stock: 150 },
    ]);
  }
  await createProduct('Pepsodent Toothpaste', 'Personal Care', 'Pepsodent', 'Unilever SL', toothImg, [
    { size: '75ml', costPrice: 110, sellingPrice: 135, stock: 220 },
    { size: '150ml', costPrice: 200, sellingPrice: 240, stock: 140 },
  ]);
  await createProduct('Vaseline Body Lotion', 'Personal Care', 'Vaseline', 'Unilever SL', skinImg, [
    { size: '100ml', costPrice: 195, sellingPrice: 235, stock: 180 },
    { size: '200ml', costPrice: 365, sellingPrice: 440, stock: 110 },
    { size: '400ml', costPrice: 695, sellingPrice: 835, stock: 60 },
  ]);
  await createProduct('Fair & Lovely Cream', 'Personal Care', 'Fair & Lovely', 'Unilever SL', skinImg, [
    { size: '25g', costPrice: 95, sellingPrice: 115, stock: 200 },
    { size: '50g', costPrice: 175, sellingPrice: 210, stock: 140 },
  ]);
  await createProduct('Dettol Antibacterial Soap', 'Personal Care', 'Dettol', 'Reckitt Lanka', soapImg, [
    { size: '75g', costPrice: 125, sellingPrice: 152, stock: 250 },
    { size: '3-Pack', costPrice: 345, sellingPrice: 415, stock: 120 },
  ]);
  await createProduct('Dettol Hand Sanitizer', 'Personal Care', 'Dettol', 'Reckitt Lanka', soapImg, [
    { size: '50ml', costPrice: 165, sellingPrice: 200, stock: 200 },
    { size: '200ml', costPrice: 445, sellingPrice: 535, stock: 100 },
  ]);

  // ─── HOUSEHOLD CLEANING ────────────────────────────────────
  const detergentImg  = 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80';
  const dishwashImg   = 'https://images.unsplash.com/photo-1584820927508-ea24c30b2c15?w=800&q=80';
  const freshenerImg  = 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=800&q=80';

  await createProduct('Surf Excel Laundry Powder', 'Household Cleaning', 'Surf Excel', 'Unilever SL', detergentImg, [
    { size: '500g', costPrice: 270, sellingPrice: 325, stock: 200 },
    { size: '1kg', costPrice: 510, sellingPrice: 615, stock: 130 },
    { size: '2kg', costPrice: 985, sellingPrice: 1180, stock: 70 },
    { size: '4kg', costPrice: 1870, sellingPrice: 2245, stock: 40 },
  ]);
  await createProduct('Rin Laundry Powder', 'Household Cleaning', 'Rin', 'Unilever SL', detergentImg, [
    { size: '500g', costPrice: 195, sellingPrice: 235, stock: 220 },
    { size: '1kg', costPrice: 375, sellingPrice: 450, stock: 140 },
    { size: '2kg', costPrice: 720, sellingPrice: 864, stock: 80 },
  ]);
  await createProduct('Sunlight Dishwash Liquid', 'Household Cleaning', 'Sunlight', 'Unilever SL', dishwashImg, [
    { size: '400ml', costPrice: 195, sellingPrice: 235, stock: 200 },
    { size: '800ml', costPrice: 365, sellingPrice: 440, stock: 120 },
  ]);
  await createProduct('Sunlight Dishwash Paste', 'Household Cleaning', 'Sunlight', 'Unilever SL', dishwashImg, [
    { size: '400g', costPrice: 145, sellingPrice: 175, stock: 220 },
    { size: '900g', costPrice: 295, sellingPrice: 355, stock: 120 },
  ]);
  await createProduct('Vim Dishwash Powder', 'Household Cleaning', 'Vim', 'Unilever SL', dishwashImg, [
    { size: '500g', costPrice: 165, sellingPrice: 200, stock: 210 },
    { size: '1kg', costPrice: 315, sellingPrice: 380, stock: 130 },
  ]);
  await createProduct('Vim Dishwash Bar', 'Household Cleaning', 'Vim', 'Unilever SL', dishwashImg, [
    { size: '200g', costPrice: 95, sellingPrice: 115, stock: 280 },
    { size: '400g', costPrice: 175, sellingPrice: 210, stock: 170 },
  ]);
  await createProduct('Harpic Toilet Cleaner', 'Household Cleaning', 'Harpic', 'Reckitt Lanka', dishwashImg, [
    { size: '500ml', costPrice: 275, sellingPrice: 330, stock: 150 },
    { size: '1L', costPrice: 510, sellingPrice: 615, stock: 80 },
  ]);
  await createProduct('Mortein Insect Spray', 'Household Cleaning', 'Mortein', 'Reckitt Lanka', dishwashImg, [
    { size: '300ml', costPrice: 420, sellingPrice: 505, stock: 120 },
    { size: '550ml', costPrice: 720, sellingPrice: 865, stock: 70 },
  ]);
  for (const scent of ['Lavender', 'Ocean Breeze', 'Rose', 'Fresh Cotton']) {
    await createProduct(`Air Wick Freshener ${scent}`, 'Household Cleaning', 'Air Wick', 'Reckitt Lanka', freshenerImg, [
      { size: '300ml', costPrice: 465, sellingPrice: 560, stock: 100 },
    ]);
  }

  // ─── PAPER & STATIONERY ─────────────────────────────────────
  const paperImg = 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&q=80';
  await createProduct('Kleenex Facial Tissue', 'Paper & Stationery', 'Sunflower', 'Sunshine Holdings', paperImg, [
    { size: '80 Sheets', costPrice: 145, sellingPrice: 175, stock: 200 },
    { size: '200 Sheets', costPrice: 295, sellingPrice: 355, stock: 120 },
  ]);
  await createProduct('Cargills Toilet Roll', 'Paper & Stationery', 'Cargills', 'Cargills Quality', paperImg, [
    { size: '4 Rolls', costPrice: 195, sellingPrice: 235, stock: 180 },
    { size: '8 Rolls', costPrice: 375, sellingPrice: 450, stock: 100 },
  ]);
  await createProduct('Cargills Kitchen Towels', 'Paper & Stationery', 'Cargills', 'Cargills Quality', paperImg, [
    { size: '2 Rolls', costPrice: 215, sellingPrice: 260, stock: 150 },
  ]);

  // ─── HEALTH & WELLNESS ──────────────────────────────────────
  const healthImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80';
  await createProduct('Dettol Antiseptic Liquid', 'Health & Wellness', 'Dettol', 'Reckitt Lanka', healthImg, [
    { size: '100ml', costPrice: 195, sellingPrice: 235, stock: 150 },
    { size: '250ml', costPrice: 445, sellingPrice: 535, stock: 90 },
    { size: '500ml', costPrice: 830, sellingPrice: 995, stock: 50 },
  ]);
  await createProduct('Sustagen Adult Nutrition', 'Health & Wellness', 'Sustagen', 'Nestle Lanka', healthImg, [
    { size: '400g', costPrice: 1650, sellingPrice: 1980, stock: 60 },
    { size: '900g', costPrice: 3500, sellingPrice: 4200, stock: 30 },
  ]);
  await createProduct('Ensure Complete Nutrition', 'Health & Wellness', 'Ensure', 'Nestle Lanka', healthImg, [
    { size: '400g', costPrice: 2150, sellingPrice: 2580, stock: 45 },
    { size: '900g', costPrice: 4600, sellingPrice: 5520, stock: 20 },
  ]);

  // ─── FROZEN & CHILLED FOODS ─────────────────────────────────
  const frozenImg  = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
  const iceCreamImg = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80';
  await createProduct('Keells Chicken Sausages', 'Frozen & Chilled Foods', 'Keells', 'Keells Food', frozenImg, [
    { size: '200g', costPrice: 320, sellingPrice: 385, stock: 100 },
    { size: '400g', costPrice: 610, sellingPrice: 730, stock: 60 },
  ]);
  await createProduct('Keells Beef Burger Patties', 'Frozen & Chilled Foods', 'Keells', 'Keells Food', frozenImg, [
    { size: '200g', costPrice: 390, sellingPrice: 470, stock: 80 },
  ]);
  await createProduct('Cargills Fish Fingers', 'Frozen & Chilled Foods', 'Cargills', 'Cargills Quality', frozenImg, [
    { size: '200g', costPrice: 360, sellingPrice: 430, stock: 90 },
    { size: '400g', costPrice: 680, sellingPrice: 815, stock: 50 },
  ]);
  for (const flavor of ['Vanilla', 'Chocolate', 'Strawberry', 'Mango', 'Butterscotch']) {
    await createProduct(`Sera Ice Cream ${flavor}`, 'Frozen & Chilled Foods', 'Sera', 'Cargills Quality', iceCreamImg, [
      { size: '500ml Tub', costPrice: 320, sellingPrice: 385, stock: 80 },
      { size: '1L Tub', costPrice: 570, sellingPrice: 685, stock: 50 },
    ]);
  }

  console.log(`\n✅ Inventory seeding complete! Total SKUs generated: ${totalSkus}`);
  console.log(`📊 Summary:`);
  console.log(`   - ${suppliersRaw.length} Suppliers`);
  console.log(`   - ${categoriesRaw.length} Categories`);
  console.log(`   - ${brandsRaw.length} Brands`);
  console.log(`   - ~${totalSkus} Product SKUs`);

  // ─── USERS ───────────────────────────────────────────────────────────────────
  console.log('\n👥 Seeding users...');
  const passwordHashAdmin = await bcrypt.hash('Admin@123', 12);
  const passwordHashCashier = await bcrypt.hash('Cashier@123', 12);
  const passwordHashManager = await bcrypt.hash('Manager@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@stocksense.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@stocksense.com',
      passwordHash: passwordHashAdmin,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'cashier@stocksense.com' },
    update: {},
    create: {
      name: 'Main Cashier',
      email: 'cashier@stocksense.com',
      passwordHash: passwordHashCashier,
      role: Role.CASHIER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@stocksense.com' },
    update: {},
    create: {
      name: 'Stock Manager',
      email: 'manager@stocksense.com',
      passwordHash: passwordHashManager,
      role: Role.INVENTORY_MANAGER,
      isActive: true,
    },
  });
  console.log('✅ Users seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
