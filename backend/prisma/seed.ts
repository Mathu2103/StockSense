import 'dotenv/config';
import { PrismaClient, BrandState, ProductStatus, Role } from '@prisma/client';
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
  console.log('🧹 Clearing inventory data...');
  await prisma.billItem.deleteMany();
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
  
  console.log('📦 Seeding suppliers...');
  const suppliersRaw = [
    { name: 'Unilever Sri Lanka', contactPerson: 'Kamal Perera', email: 'sales@unilever.lk', phone: '0112345678', address: 'Colombo' },
    { name: 'Hemas Consumer Brands', contactPerson: 'Nimal Silva', email: 'sales@hemas.com', phone: '0112445678', address: 'Colombo' },
    { name: 'CBL (Munchee)', contactPerson: 'Ruwan Kumara', email: 'orders@munchee.lk', phone: '0112545678', address: 'Pannipitiya' },
    { name: 'Maliban Biscuit', contactPerson: 'Saman Perera', email: 'sales@maliban.lk', phone: '0112645678', address: 'Ratmalana' },
    { name: 'Nestle Lanka', contactPerson: 'Janaka', email: 'orders@nestle.lk', phone: '0112745678', address: 'Kurunegala' },
    { name: 'Fonterra Brands', contactPerson: 'Sunil', email: 'sales@fonterra.lk', phone: '0112845678', address: 'Biyagama' },
    { name: 'Cargills PLC', contactPerson: 'Mohan', email: 'orders@cargills.lk', phone: '0112945678', address: 'Colombo' },
    { name: 'Ceylon Cold Stores', contactPerson: 'Ajith', email: 'sales@elephanthouse.lk', phone: '0113045678', address: 'Colombo' },
    { name: 'CIC Holdings', contactPerson: 'Bandara', email: 'sales@cic.lk', phone: '0113145678', address: 'Peliyagoda' },
    { name: 'Dilmah Ceylon Tea', contactPerson: 'Roshan', email: 'sales@dilmahtea.com', phone: '0113245678', address: 'Peliyagoda' },
    { name: 'Bairaha Farms', contactPerson: 'Nuwan', email: 'sales@bairaha.com', phone: '0113345678', address: 'Colombo' },
    { name: 'Reckitt Benckiser', contactPerson: 'Dinesh', email: 'sales@reckitt.lk', phone: '0113445678', address: 'Colombo' },
    { name: 'Haleon', contactPerson: 'Asanka', email: 'sales@haleon.com', phone: '0113545678', address: 'Colombo' },
    { name: 'Mannar Wholesale Distributors', contactPerson: 'Jude', email: 'mannarwd@gmail.com', phone: '0232223456', address: 'Mannar Town' },
    { name: 'Northern Traders', contactPerson: 'Ramesh', email: 'northerntraders@yahoo.com', phone: '0232224567', address: 'Mannar' },
    { name: 'St. Marys Dry Fish Exporters', contactPerson: 'Anton', email: 'stmarys@mannar.lk', phone: '0232225678', address: 'Pesalai, Mannar' },
    { name: 'Mannar Rice Mill', contactPerson: 'Sivakumar', email: 'ricemill@mannar.com', phone: '0232226789', address: 'Murunkan, Mannar' },
    { name: 'Sathosa Mannar Hub', contactPerson: 'Manager', email: 'sathosa.mannar@gov.lk', phone: '0232227890', address: 'Mannar Town' },
  ];

  const baseDate = new Date('2023-01-01T00:00:00Z');

  const supplierMap: Record<string, any> = {};
  for (const s of suppliersRaw) {
    supplierMap[s.name] = await prisma.supplier.create({ 
      data: { 
        name: s.name, 
        companyName: s.name, 
        email: s.email, 
        phone: s.phone, 
        address: s.address,
        createdAt: baseDate
      } 
    });
  }

  console.log('📂 Seeding categories and subcategories...');
  const categoriesRaw = [
    { name: 'Grocery & Staples', subs: ['Rice', 'Dhal & Pulses', 'Flour', 'Sugar', 'Spices & Condiments', 'Oil'] },
    { name: 'Beverages', subs: ['Tea', 'Coffee', 'Soft Drinks', 'Fruit Juices', 'Water', 'Malt & Energy Drinks'] },
    { name: 'Snacks & Confectionery', subs: ['Biscuits', 'Chocolates', 'Chips & Murukku', 'Sweets'] },
    { name: 'Personal Care', subs: ['Soaps & Body Wash', 'Hair Care', 'Oral Care', 'Skin Care'] },
    { name: 'Household Care', subs: ['Laundry Detergents', 'Surface Cleaners', 'Dishwashing', 'Repellents'] },
    { name: 'Dairy & Chilled', subs: ['Milk Powder', 'Fresh Milk', 'Butter & Cheese', 'Yoghurt'] },
    { name: 'Frozen Foods', subs: ['Ice Cream', 'Processed Meats'] },
    { name: 'Baby Care', subs: ['Baby Diapers', 'Baby Food', 'Baby Toiletries'] },
    { name: 'Bakery', subs: ['Bread', 'Buns & Cakes'] },
    { name: 'Local & Dry Goods', subs: ['Dry Fish (Karuvadu)', 'Local Sweets'] }
  ];

  const categoryMap: Record<string, any> = {};
  const subCategoryMap: Record<string, any> = {};
  for (const c of categoriesRaw) {
    const cat = await prisma.category.create({ data: { name: c.name, description: `All ${c.name}` } });
    categoryMap[c.name] = cat;
    for (const sub of c.subs) {
      const createdSub = await prisma.subCategory.create({ data: { name: sub, categoryId: cat.id } });
      subCategoryMap[`${c.name}-${sub}`] = createdSub;
    }
  }

  console.log('🏷️ Seeding brands...');
  const brandsRaw = [
    'Sunsilk', 'Lifebuoy', 'Signal', 'Clogard', 'Baby Cheramy', 'Munchee', 'Maliban', 'Maggi', 'Milo', 
    'Anchor', 'Ratthi', 'Kotmale', 'Elephant House', 'Kist', 'Dettol', 'Harpic', 'Prima', 'Roza', 'Dilmah', 
    'Zesta', 'Sustagen', 'Viva', 'Nestomalt', 'Nescafe', 'Gold Leaf', 'Ritzbury', 'Kandos', 'Edinborough',
    'Araliya', 'Nipuna', 'CIC', 'Marina', 'Fortune', 'Sunquick', 'Coca-Cola', 'Sprite', 'Fanta', 'Knorr',
    'MD', 'Sera', 'Bairaha', 'Crysbro', 'Keells', 'Magic', 'Highland', 'Pelwatte', 'Velona', 'Pears', 
    'Lysol', 'Vim', 'Sunlight', 'Surf Excel', 'Diva', 'Kumarika', 'Vatika', 'Clear', 'Dove', 'Sensodyne',
    'Local', 'Pesalai Dry Fish', 'Mannar Mill', 'Sathosa Mannar Hub'
  ];
  
  const brandMap: Record<string, any> = {};
  for (const b of brandsRaw) {
    brandMap[b] = await prisma.brand.create({ data: { name: b, state: BrandState.ACTIVE } });
  }

  console.log('🛒 Generating products...');
  
  // Define Master Products with variants to generate 500+ SKUs
  const masterProducts = [
    // RICE
    { name: 'Keeri Samba Rice', cat: 'Grocery & Staples', sub: 'Rice', brand: 'Araliya', sup: 'Northern Traders',
      variants: [{v:'1Kg', p:380, c:350}, {v:'5Kg', p:1850, c:1750}, {v:'10Kg', p:3650, c:3450}, {v:'25Kg', p:9000, c:8600}] },
    { name: 'Nadu Rice', cat: 'Grocery & Staples', sub: 'Rice', brand: 'Nipuna', sup: 'Mannar Rice Mill',
      variants: [{v:'1Kg', p:220, c:200}, {v:'5Kg', p:1080, c:1000}, {v:'10Kg', p:2150, c:1950}, {v:'25Kg', p:5300, c:4850}] },
    { name: 'Samba Rice', cat: 'Grocery & Staples', sub: 'Rice', brand: 'Local', sup: 'Mannar Rice Mill',
      variants: [{v:'1Kg', p:240, c:220}, {v:'5Kg', p:1180, c:1100}, {v:'10Kg', p:2350, c:2150}, {v:'25Kg', p:5800, c:5300}] },
    { name: 'Basmati Rice', cat: 'Grocery & Staples', sub: 'Rice', brand: 'CIC', sup: 'CIC Holdings',
      variants: [{v:'1Kg', p:850, c:780}, {v:'5Kg', p:4200, c:3850}] },

    // DHAL & PULSES
    { name: 'Mysore Dhal', cat: 'Grocery & Staples', sub: 'Dhal & Pulses', brand: 'Local', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'250g', p:110, c:95}, {v:'500g', p:210, c:185}, {v:'1Kg', p:400, c:360}, {v:'5Kg', p:1950, c:1780}] },
    { name: 'Green Gram', cat: 'Grocery & Staples', sub: 'Dhal & Pulses', brand: 'Sathosa Mannar Hub', sup: 'Sathosa Mannar Hub',
      variants: [{v:'500g', p:350, c:300}, {v:'1Kg', p:680, c:590}] },
    { name: 'Chickpeas', cat: 'Grocery & Staples', sub: 'Dhal & Pulses', brand: 'Local', sup: 'Northern Traders',
      variants: [{v:'500g', p:450, c:390}, {v:'1Kg', p:880, c:770}] },

    // FLOUR & SUGAR
    { name: 'Wheat Flour', cat: 'Grocery & Staples', sub: 'Flour', brand: 'Prima', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'1Kg', p:210, c:190}, {v:'5Kg', p:1030, c:940}, {v:'50Kg', p:10000, c:9200}] },
    { name: 'Kurakkan Flour', cat: 'Grocery & Staples', sub: 'Flour', brand: 'Local', sup: 'Northern Traders',
      variants: [{v:'500g', p:320, c:280}, {v:'1Kg', p:620, c:550}] },
    { name: 'White Sugar', cat: 'Grocery & Staples', sub: 'Sugar', brand: 'Local', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'500g', p:160, c:145}, {v:'1Kg', p:310, c:285}, {v:'5Kg', p:1530, c:1420}, {v:'50Kg', p:15000, c:14000}] },
    { name: 'Brown Sugar', cat: 'Grocery & Staples', sub: 'Sugar', brand: 'Sathosa Mannar Hub', sup: 'Sathosa Mannar Hub',
      variants: [{v:'1Kg', p:350, c:310}, {v:'5Kg', p:1720, c:1540}] },

    // SPICES & OIL
    { name: 'Chilli Powder', cat: 'Grocery & Staples', sub: 'Spices & Condiments', brand: 'Local', sup: 'Northern Traders',
      variants: [{v:'100g', p:180, c:150}, {v:'250g', p:420, c:360}, {v:'500g', p:800, c:700}, {v:'1Kg', p:1550, c:1350}] },
    { name: 'Curry Powder (Roasted)', cat: 'Grocery & Staples', sub: 'Spices & Condiments', brand: 'Local', sup: 'Northern Traders',
      variants: [{v:'100g', p:160, c:130}, {v:'250g', p:380, c:310}, {v:'500g', p:720, c:600}] },
    { name: 'Turmeric Powder', cat: 'Grocery & Staples', sub: 'Spices & Condiments', brand: 'Local', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'50g', p:90, c:75}, {v:'100g', p:170, c:140}, {v:'250g', p:400, c:340}] },
    { name: 'Coconut Oil', cat: 'Grocery & Staples', sub: 'Oil', brand: 'Marina', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'500ml', p:480, c:430}, {v:'1L', p:950, c:850}, {v:'5L', p:4600, c:4200}] },
    { name: 'Vegetable Oil', cat: 'Grocery & Staples', sub: 'Oil', brand: 'Fortune', sup: 'Northern Traders',
      variants: [{v:'1L', p:750, c:680}, {v:'2L', p:1480, c:1350}, {v:'5L', p:3650, c:3350}] },

    // DRY FISH (MANNAR SPECIAL)
    { name: 'Katta Karuvadu', cat: 'Local & Dry Goods', sub: 'Dry Fish (Karuvadu)', brand: 'Pesalai Dry Fish', sup: 'St. Marys Dry Fish Exporters',
      variants: [{v:'100g', p:400, c:320}, {v:'250g', p:950, c:780}, {v:'500g', p:1850, c:1550}, {v:'1Kg', p:3600, c:3000}] },
    { name: 'Sprats (Keeramin)', cat: 'Local & Dry Goods', sub: 'Dry Fish (Karuvadu)', brand: 'Pesalai Dry Fish', sup: 'St. Marys Dry Fish Exporters',
      variants: [{v:'100g', p:150, c:120}, {v:'250g', p:360, c:290}, {v:'500g', p:700, c:560}, {v:'1Kg', p:1350, c:1100}] },
    { name: 'Kumbalava Dry Fish', cat: 'Local & Dry Goods', sub: 'Dry Fish (Karuvadu)', brand: 'Pesalai Dry Fish', sup: 'St. Marys Dry Fish Exporters',
      variants: [{v:'250g', p:550, c:450}, {v:'500g', p:1050, c:880}, {v:'1Kg', p:2000, c:1700}] },

    // BEVERAGES
    { name: 'Tea Dust', cat: 'Beverages', sub: 'Tea', brand: 'Zesta', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'100g', p:250, c:220}, {v:'200g', p:490, c:430}, {v:'500g', p:1200, c:1050}, {v:'1Kg', p:2350, c:2080}] },
    { name: 'Premium Tea Leaves', cat: 'Beverages', sub: 'Tea', brand: 'Dilmah', sup: 'Dilmah Ceylon Tea',
      variants: [{v:'100g', p:380, c:320}, {v:'200g', p:740, c:630}, {v:'400g', p:1450, c:1250}] },
    { name: 'Milo Powder', cat: 'Beverages', sub: 'Malt & Energy Drinks', brand: 'Milo', sup: 'Nestle Lanka',
      variants: [{v:'200g', p:500, c:440}, {v:'400g', p:980, c:870}, {v:'1Kg', p:2400, c:2150}] },
    { name: 'Nestomalt', cat: 'Beverages', sub: 'Malt & Energy Drinks', brand: 'Nestomalt', sup: 'Nestle Lanka',
      variants: [{v:'200g', p:480, c:420}, {v:'400g', p:940, c:830}, {v:'1Kg', p:2300, c:2050}] },
    { name: 'Nescafe Classic', cat: 'Beverages', sub: 'Coffee', brand: 'Nescafe', sup: 'Nestle Lanka',
      variants: [{v:'50g', p:750, c:650}, {v:'100g', p:1450, c:1250}, {v:'200g', p:2800, c:2450}] },
    { name: 'Coca-Cola', cat: 'Beverages', sub: 'Soft Drinks', brand: 'Coca-Cola', sup: 'Northern Traders',
      variants: [{v:'400ml', p:120, c:100}, {v:'1L', p:280, c:240}, {v:'1.5L', p:380, c:330}, {v:'2L', p:480, c:420}] },
    { name: 'Sprite', cat: 'Beverages', sub: 'Soft Drinks', brand: 'Sprite', sup: 'Northern Traders',
      variants: [{v:'400ml', p:120, c:100}, {v:'1.5L', p:380, c:330}] },
    { name: 'Sunquick Orange', cat: 'Beverages', sub: 'Fruit Juices', brand: 'Sunquick', sup: 'Northern Traders',
      variants: [{v:'330ml', p:850, c:740}, {v:'840ml', p:1850, c:1600}] },
    
    // SNACKS & BISCUITS
    { name: 'Lemon Puff', cat: 'Snacks & Confectionery', sub: 'Biscuits', brand: 'Munchee', sup: 'CBL (Munchee)',
      variants: [{v:'100g', p:100, c:85}, {v:'200g', p:190, c:165}, {v:'400g', p:370, c:320}] },
    { name: 'Cream Cracker', cat: 'Snacks & Confectionery', sub: 'Biscuits', brand: 'Maliban', sup: 'Maliban Biscuit',
      variants: [{v:'125g', p:90, c:75}, {v:'190g', p:140, c:120}, {v:'330g', p:240, c:205}, {v:'500g', p:360, c:310}] },
    { name: 'Chocolate Cream Biscuit', cat: 'Snacks & Confectionery', sub: 'Biscuits', brand: 'Munchee', sup: 'CBL (Munchee)',
      variants: [{v:'100g', p:120, c:100}, {v:'400g', p:450, c:390}] },
    { name: 'Marie Biscuit', cat: 'Snacks & Confectionery', sub: 'Biscuits', brand: 'Maliban', sup: 'Maliban Biscuit',
      variants: [{v:'80g', p:80, c:65}, {v:'300g', p:280, c:240}] },
    { name: 'Kandos Milk Chocolate', cat: 'Snacks & Confectionery', sub: 'Chocolates', brand: 'Kandos', sup: 'Northern Traders',
      variants: [{v:'45g', p:150, c:130}, {v:'100g', p:320, c:280}, {v:'200g', p:620, c:540}] },
    { name: 'Ritzbury Revello', cat: 'Snacks & Confectionery', sub: 'Chocolates', brand: 'Ritzbury', sup: 'CBL (Munchee)',
      variants: [{v:'50g', p:180, c:155}, {v:'100g', p:350, c:300}] },
    { name: 'Cassava Chips (Manioc)', cat: 'Snacks & Confectionery', sub: 'Chips & Murukku', brand: 'Local', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'50g', p:80, c:65}, {v:'100g', p:150, c:120}, {v:'250g', p:350, c:280}] },
    { name: 'Murukku Packet', cat: 'Snacks & Confectionery', sub: 'Chips & Murukku', brand: 'Local', sup: 'Northern Traders',
      variants: [{v:'100g', p:100, c:80}, {v:'200g', p:190, c:150}] },

    // PERSONAL CARE
    { name: 'Sunsilk Black Shine Shampoo', cat: 'Personal Care', sub: 'Hair Care', brand: 'Sunsilk', sup: 'Unilever Sri Lanka',
      variants: [{v:'90ml', p:320, c:280}, {v:'180ml', p:580, c:510}, {v:'340ml', p:1050, c:920}, {v:'680ml', p:1950, c:1720}] },
    { name: 'Clear Anti-Dandruff Shampoo', cat: 'Personal Care', sub: 'Hair Care', brand: 'Clear', sup: 'Unilever Sri Lanka',
      variants: [{v:'80ml', p:350, c:310}, {v:'170ml', p:650, c:570}, {v:'330ml', p:1200, c:1050}] },
    { name: 'Lifebuoy Soap Total 10', cat: 'Personal Care', sub: 'Soaps & Body Wash', brand: 'Lifebuoy', sup: 'Unilever Sri Lanka',
      variants: [{v:'50g', p:65, c:55}, {v:'100g', p:120, c:100}, {v:'100g x 4', p:450, c:390}] },
    { name: 'Signal Toothpaste', cat: 'Personal Care', sub: 'Oral Care', brand: 'Signal', sup: 'Unilever Sri Lanka',
      variants: [{v:'40g', p:95, c:80}, {v:'120g', p:240, c:210}, {v:'160g', p:320, c:280}] },
    { name: 'Sensodyne Repair', cat: 'Personal Care', sub: 'Oral Care', brand: 'Sensodyne', sup: 'Haleon',
      variants: [{v:'100g', p:750, c:650}] },
    { name: 'Kumarika Hair Oil', cat: 'Personal Care', sub: 'Hair Care', brand: 'Kumarika', sup: 'Hemas Consumer Brands',
      variants: [{v:'100ml', p:220, c:190}, {v:'200ml', p:420, c:360}] },
    { name: 'Dove Beauty Bathing Bar', cat: 'Personal Care', sub: 'Soaps & Body Wash', brand: 'Dove', sup: 'Unilever Sri Lanka',
      variants: [{v:'100g', p:350, c:300}] },

    // HOUSEHOLD CARE
    { name: 'Surf Excel Detergent Powder', cat: 'Household Care', sub: 'Laundry Detergents', brand: 'Surf Excel', sup: 'Unilever Sri Lanka',
      variants: [{v:'200g', p:180, c:155}, {v:'500g', p:420, c:370}, {v:'1Kg', p:820, c:720}] },
    { name: 'Sunlight Washing Soap', cat: 'Household Care', sub: 'Laundry Detergents', brand: 'Sunlight', sup: 'Unilever Sri Lanka',
      variants: [{v:'120g', p:80, c:70}, {v:'120g x 4', p:310, c:275}] },
    { name: 'Diva Washing Powder', cat: 'Household Care', sub: 'Laundry Detergents', brand: 'Diva', sup: 'Hemas Consumer Brands',
      variants: [{v:'400g', p:280, c:240}, {v:'1Kg', p:650, c:560}] },
    { name: 'Vim Dishwash Liquid', cat: 'Household Care', sub: 'Dishwashing', brand: 'Vim', sup: 'Unilever Sri Lanka',
      variants: [{v:'250ml', p:250, c:220}, {v:'500ml', p:480, c:420}] },
    { name: 'Lysol Floor Cleaner', cat: 'Household Care', sub: 'Surface Cleaners', brand: 'Lysol', sup: 'Reckitt Benckiser',
      variants: [{v:'500ml', p:550, c:480}, {v:'1L', p:1050, c:920}] },
    { name: 'Harpic Toilet Cleaner', cat: 'Household Care', sub: 'Surface Cleaners', brand: 'Harpic', sup: 'Reckitt Benckiser',
      variants: [{v:'500ml', p:480, c:420}, {v:'750ml', p:680, c:590}] },

    // DAIRY & CHILLED
    { name: 'Anchor Full Cream Milk Powder', cat: 'Dairy & Chilled', sub: 'Milk Powder', brand: 'Anchor', sup: 'Fonterra Brands',
      variants: [{v:'75g', p:250, c:230}, {v:'400g', p:1200, c:1120}, {v:'1Kg', p:2950, c:2780}] },
    { name: 'Highland Milk Powder', cat: 'Dairy & Chilled', sub: 'Milk Powder', brand: 'Highland', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'400g', p:1150, c:1080}, {v:'1Kg', p:2850, c:2680}] },
    { name: 'Ratthi Milk Powder', cat: 'Dairy & Chilled', sub: 'Milk Powder', brand: 'Ratthi', sup: 'Fonterra Brands',
      variants: [{v:'400g', p:1180, c:1100}] },
    { name: 'Kotmale Fresh Milk', cat: 'Dairy & Chilled', sub: 'Fresh Milk', brand: 'Kotmale', sup: 'Cargills PLC',
      variants: [{v:'500ml', p:280, c:250}, {v:'1L', p:520, c:460}] },
    { name: 'Highland Yoghurt', cat: 'Dairy & Chilled', sub: 'Yoghurt', brand: 'Highland', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'80g', p:70, c:60}] },
    { name: 'Kotmale Set Yoghurt', cat: 'Dairy & Chilled', sub: 'Yoghurt', brand: 'Kotmale', sup: 'Cargills PLC',
      variants: [{v:'80g', p:75, c:65}] },
    { name: 'Astra Margarine', cat: 'Dairy & Chilled', sub: 'Butter & Cheese', brand: 'Anchor', sup: 'Fonterra Brands',
      variants: [{v:'100g', p:250, c:220}, {v:'250g', p:580, c:510}] },
    { name: 'Happy Cow Cheese', cat: 'Dairy & Chilled', sub: 'Butter & Cheese', brand: 'Anchor', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'120g (8 Portions)', p:780, c:680}] },

    // FROZEN FOODS
    { name: 'Elephant House Vanilla Ice Cream', cat: 'Frozen Foods', sub: 'Ice Cream', brand: 'Elephant House', sup: 'Ceylon Cold Stores',
      variants: [{v:'1L', p:750, c:650}, {v:'2L', p:1450, c:1280}, {v:'4L', p:2800, c:2480}] },
    { name: 'Elephant House Chocolate Ice Cream', cat: 'Frozen Foods', sub: 'Ice Cream', brand: 'Elephant House', sup: 'Ceylon Cold Stores',
      variants: [{v:'1L', p:800, c:700}, {v:'2L', p:1550, c:1350}] },
    { name: 'Magic Fruit & Nut Ice Cream', cat: 'Frozen Foods', sub: 'Ice Cream', brand: 'Magic', sup: 'Cargills PLC',
      variants: [{v:'1L', p:950, c:820}] },
    { name: 'Bairaha Chicken Sausages', cat: 'Frozen Foods', sub: 'Processed Meats', brand: 'Bairaha', sup: 'Bairaha Farms',
      variants: [{v:'250g', p:480, c:420}, {v:'500g', p:920, c:810}] },
    { name: 'Keells Chicken Meatballs', cat: 'Frozen Foods', sub: 'Processed Meats', brand: 'Keells', sup: 'Northern Traders',
      variants: [{v:'200g', p:450, c:390}, {v:'500g', p:1050, c:920}] },
    { name: 'Bairaha Whole Chicken (Frozen)', cat: 'Frozen Foods', sub: 'Processed Meats', brand: 'Bairaha', sup: 'Bairaha Farms',
      variants: [{v:'1Kg', p:1250, c:1120}, {v:'1.2Kg', p:1500, c:1350}] },

    // BABY CARE
    { name: 'Baby Cheramy Soap', cat: 'Baby Care', sub: 'Baby Toiletries', brand: 'Baby Cheramy', sup: 'Hemas Consumer Brands',
      variants: [{v:'100g', p:150, c:130}] },
    { name: 'Baby Cheramy Cologne', cat: 'Baby Care', sub: 'Baby Toiletries', brand: 'Baby Cheramy', sup: 'Hemas Consumer Brands',
      variants: [{v:'100ml', p:350, c:300}] },
    { name: 'Pears Baby Lotion', cat: 'Baby Care', sub: 'Baby Toiletries', brand: 'Pears', sup: 'Unilever Sri Lanka',
      variants: [{v:'100ml', p:420, c:360}, {v:'200ml', p:780, c:680}] },
    { name: 'Velona Cuddles Diapers', cat: 'Baby Care', sub: 'Baby Diapers', brand: 'Velona', sup: 'Northern Traders',
      variants: [{v:'Small (10pcs)', p:850, c:750}, {v:'Medium (10pcs)', p:950, c:840}, {v:'Large (10pcs)', p:1050, c:930}] },
    { name: 'Cerelac Wheat & Milk', cat: 'Baby Care', sub: 'Baby Food', brand: 'Maggi', sup: 'Nestle Lanka',
      variants: [{v:'400g', p:1250, c:1100}] },

    // BAKERY
    { name: 'Sliced Bread', cat: 'Bakery', sub: 'Bread', brand: 'Local', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'450g', p:180, c:150}] },
    { name: 'Roast Bread', cat: 'Bakery', sub: 'Bread', brand: 'Local', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'450g', p:200, c:170}] },
    { name: 'Tea Bun', cat: 'Bakery', sub: 'Buns & Cakes', brand: 'Local', sup: 'Northern Traders',
      variants: [{v:'1 piece', p:80, c:65}, {v:'5 pieces', p:380, c:310}] },
    { name: 'Butter Cake', cat: 'Bakery', sub: 'Buns & Cakes', brand: 'Local', sup: 'Mannar Wholesale Distributors',
      variants: [{v:'250g', p:350, c:290}, {v:'500g', p:680, c:560}] },

    // MORE NOODLES & CONDIMENTS
    { name: 'Maggi Chicken Noodles', cat: 'Grocery & Staples', sub: 'Flour', brand: 'Maggi', sup: 'Nestle Lanka',
      variants: [{v:'73g', p:110, c:95}, {v:'350g (Family)', p:520, c:450}] },
    { name: 'Maggi Kottu Mee', cat: 'Grocery & Staples', sub: 'Flour', brand: 'Maggi', sup: 'Nestle Lanka',
      variants: [{v:'80g', p:130, c:110}] },
    { name: 'Kist Tomato Sauce', cat: 'Grocery & Staples', sub: 'Spices & Condiments', brand: 'Kist', sup: 'Cargills PLC',
      variants: [{v:'400g', p:450, c:390}, {v:'1Kg', p:950, c:840}] },
    { name: 'MD Chilli Sauce', cat: 'Grocery & Staples', sub: 'Spices & Condiments', brand: 'MD', sup: 'Northern Traders',
      variants: [{v:'400g', p:480, c:410}] },
    { name: 'Knorr Chicken Cubes', cat: 'Grocery & Staples', sub: 'Spices & Condiments', brand: 'Knorr', sup: 'Unilever Sri Lanka',
      variants: [{v:'20g (2 Cubes)', p:90, c:75}, {v:'60g (6 Cubes)', p:250, c:210}] },
  ];

  let totalSkus = 0;
  let currentSeq = 1;

  for (const mp of masterProducts) {
    const categoryName = mp.cat;
    const subCategoryKey = `${mp.cat}-${mp.sub}`;
    const brandName = mp.brand;
    const supplierName = mp.sup;

    const category = categoryMap[categoryName];
    const subCategory = subCategoryMap[subCategoryKey];
    const brand = brandMap[brandName];
    const supplier = supplierMap[supplierName];

    if (!category) console.error('Missing category', categoryName);
    if (!subCategory) console.error('Missing subcategory', subCategoryKey);
    if (!brand) console.error('Missing brand', brandName);
    if (!supplier) console.error('Missing supplier', supplierName);

    const master = await prisma.masterProductClass.create({
      data: {
        name: mp.name,
        categoryId: category.id,
        subCategoryId: subCategory ? subCategory.id : undefined,
        brandId: brand.id,
        supplierId: supplier.id,
        hasVariant: mp.variants.length > 1,
        createdAt: baseDate
      }
    });

    for (const variant of mp.variants) {
      const sku = makeSku(brandName, mp.name, variant.v, currentSeq++);
      const barcode = generateBarcode();
      const unitType = variant.v.replace(/[0-9.]/g, '').trim().toUpperCase() || 'PCS';
      
      // Stock logic
      const isLowStock = Math.random() > 0.8;
      const stock = isLowStock ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 80) + 20;
      
      const imageUrl = category.categoryImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';

      await prisma.product.create({
        data: {
          sku,
          masterId: master.id,
          barcode,
          name: `${mp.name} ${variant.v}`,
          unitType,
          costPrice: variant.c,
          sellingPrice: variant.p,
          currentStock: stock,
          reorderLevel: 20,
          targetCapacity: 150,
          status: ProductStatus.ACTIVE,
          imageUrl,
          variantAttributeType: variant.v,
          createdAt: baseDate,
          updatedAt: baseDate
        }
      });
      totalSkus++;
    }
  }

  // Multiply variants to reach 500+ SKUs by creating bulk variants (x2 to x3 multiplier)
  console.log('🔄 Multiplying variants to achieve 500+ SKUs limit...');
  for (const mp of masterProducts) {
    // We create promotional or multipack variants to explode the SKU count realistically
    const master = await prisma.masterProductClass.findFirst({ where: { name: mp.name } });
    if (!master) continue;

    const subCategoryKey = `${mp.cat}-${mp.sub}`;
    const subCategory = subCategoryMap[subCategoryKey];

    for (const variant of mp.variants) {
      // Multipack 3x
      const sku3x = makeSku(mp.brand, mp.name, `3x${variant.v}`, currentSeq++);
      const price3x = variant.p * 3 * 0.95; // 5% discount
      await prisma.product.create({
        data: {
          sku: sku3x, masterId: master.id, barcode: generateBarcode(),
          name: `${mp.name} ${variant.v} (Pack of 3)`, unitType: 'PACK', costPrice: variant.c * 3,
          sellingPrice: Math.round(price3x), currentStock: Math.floor(Math.random() * 30),
          reorderLevel: 10, targetCapacity: 50, status: ProductStatus.ACTIVE, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
          variantAttributeType: `Pack of 3`, createdAt: baseDate, updatedAt: baseDate
        }
      });
      totalSkus++;

      // Multipack 6x
      const sku6x = makeSku(mp.brand, mp.name, `6x${variant.v}`, currentSeq++);
      const price6x = variant.p * 6 * 0.90; // 10% discount
      await prisma.product.create({
        data: {
          sku: sku6x, masterId: master.id, barcode: generateBarcode(),
          name: `${mp.name} ${variant.v} (Pack of 6)`, unitType: 'PACK', costPrice: variant.c * 6,
          sellingPrice: Math.round(price6x), currentStock: Math.floor(Math.random() * 20),
          reorderLevel: 10, targetCapacity: 50, status: ProductStatus.ACTIVE, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
          variantAttributeType: `Pack of 6`, createdAt: baseDate, updatedAt: baseDate
        }
      });
      totalSkus++;
    }
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

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stocksense.com' }, update: {},
    create: { name: 'Super Admin', email: 'admin@stocksense.com', passwordHash: passwordHashAdmin, role: Role.ADMIN, isActive: true, createdAt: baseDate, updatedAt: baseDate },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@stocksense.com' }, update: {},
    create: { name: 'Main Cashier', email: 'cashier@stocksense.com', passwordHash: passwordHashCashier, role: Role.CASHIER, isActive: true, createdAt: baseDate, updatedAt: baseDate },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@stocksense.com' }, update: {},
    create: { name: 'Stock Manager', email: 'manager@stocksense.com', passwordHash: passwordHashManager, role: Role.INVENTORY_MANAGER, isActive: true, createdAt: baseDate, updatedAt: baseDate },
  });
  console.log('✅ Users seeded successfully!');

  // ─── HISTORICAL DATA GENERATION ──────────────────────────────────────────────
  console.log('\\n🕰️ Generating historical transactions (2023 - 2026)...');
  
  const startDate = new Date('2023-01-01T00:00:00Z').getTime();
  const endDate = new Date('2026-01-01T00:00:00Z').getTime();

  function randomDate() {
    return new Date(startDate + Math.random() * (endDate - startDate));
  }

  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const allProducts = await prisma.product.findMany();
  const allSuppliers = await prisma.supplier.findMany();
  const usersForOps = [adminUser.id, managerUser.id];
  const cashiers = [cashierUser.id];

  // 1. Generate GRNs
  console.log('   📦 Generating 300 Goods Receiving Notes...');
  const grnItemData = [];
  for (let i = 1; i <= 300; i++) {
    const grnId = `GRN-${i.toString().padStart(5, '0')}`;
    const rDate = randomDate();
    const supplier = allSuppliers[randomInt(0, allSuppliers.length - 1)];
    const operatorId = usersForOps[randomInt(0, usersForOps.length - 1)];
    
    // Create GRN
    const dbGrn = await prisma.goodsReceivingNote.create({
      data: {
        grnId,
        supplierId: supplier.id,
        operatorId,
        grnDate: rDate,
        notes: `Historical GRN ${i}`
      }
    });

    const numItems = randomInt(2, 8);
    for (let j = 0; j < numItems; j++) {
      const product = allProducts[randomInt(0, allProducts.length - 1)];
      const addedQty = randomInt(10, 100);
      grnItemData.push({
        grnId: dbGrn.id,
        sku: product.sku,
        addedQuantity: addedQty,
        finalQuantity: addedQty + randomInt(0, 50),
        unitCost: product.costPrice,
      });
    }
  }
  if (grnItemData.length > 0) {
    await prisma.grnItem.createMany({ data: grnItemData });
  }

  // 2. Generate Stock Adjustments
  console.log('   ⚖️ Generating 150 Stock Adjustments...');
  const reasons = ['DAMAGED', 'LOST', 'EXPIRED', 'RETURNED', 'COUNTING_ERROR', 'SYSTEM_CORRECTION'] as const;
  const adjData = [];
  for (let i = 0; i < 150; i++) {
    const product = allProducts[randomInt(0, allProducts.length - 1)];
    const rDate = randomDate();
    const reason = reasons[randomInt(0, reasons.length - 1)];
    const qtyChanged = randomInt(-10, 10);
    if (qtyChanged === 0) continue;

    adjData.push({
      sku: product.sku,
      qtyChanged,
      reason,
      adjustedById: usersForOps[randomInt(0, usersForOps.length - 1)],
      finalQuantity: Math.max(0, product.currentStock + qtyChanged),
      createdAt: rDate
    });
  }
  if (adjData.length > 0) {
    await prisma.stockAdjustment.createMany({ data: adjData });
  }

  // 3. Generate Sales Bills
  console.log('   🧾 Generating 2000 Sales Bills...');
  let billCount = 1;
  const BATCH_SIZE = 500;
  
  for (let batch = 0; batch < 4; batch++) { // 4 * 500 = 2000
    const billsBatch = [];
    
    for (let i = 0; i < BATCH_SIZE; i++) {
      const rDate = randomDate();
      const cashierId = cashiers[0];
      const numItems = randomInt(1, 10);
      let subtotal = 0;
      let totalQty = 0;
      const billItemsToCreate = [];

      for (let j = 0; j < numItems; j++) {
        const product = allProducts[randomInt(0, allProducts.length - 1)];
        const qty = randomInt(1, 5);
        const itemTotal = qty * product.sellingPrice;
        
        subtotal += itemTotal;
        totalQty += qty;

        billItemsToCreate.push({
          sku: product.sku,
          qty,
          unitPrice: product.sellingPrice,
          total: itemTotal,
        });
      }

      const totalDiscount = Math.random() > 0.9 ? randomInt(50, 200) : 0;
      const totalBill = Math.max(0, subtotal - totalDiscount);
      
      const billNumber = `INV-${billCount.toString().padStart(6, '0')}`;
      billCount++;

      billsBatch.push({
        billNumber,
        cashierId,
        subtotal,
        totalDiscount,
        totalBill,
        paymentMethod: Math.random() > 0.7 ? 'CARD' : 'CASH',
        draft: false,
        totalQty,
        createdAt: rDate,
        items: billItemsToCreate
      });
    }

    for (const b of billsBatch) {
      await prisma.bill.create({
        data: {
          billNumber: b.billNumber,
          cashierId: b.cashierId,
          subtotal: b.subtotal,
          totalDiscount: b.totalDiscount,
          totalBill: b.totalBill,
          paymentMethod: b.paymentMethod as any,
          draft: b.draft,
          totalQty: b.totalQty,
          createdAt: b.createdAt,
          billItems: {
            create: b.items
          }
        }
      });
    }
  }

  console.log('✅ Historical transactions seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
