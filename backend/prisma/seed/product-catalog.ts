import { ProductStatus } from '@prisma/client';
import { SeededRandom } from './deterministic-random.js';
import { DemandProfileType } from './product-demand-profiles.js';

export interface ProductCatalogItem {
  sku: string;
  name: string;
  masterId: string;
  barcode: string;
  subCategoryId: string;
  brandId: string;
  supplierId: string;
  unitType: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  targetCapacity: number;
  status: ProductStatus;
  demandProfile: DemandProfileType;
  seasonal: string | null;
  launchDate: Date;
  discontinuationDate: Date | null;
  shelfLifeDays?: number;
}

export function generateProductCatalog(
  random: SeededRandom,
  categories: { id: string; name: string }[],
  subCategories: { id: string; name: string; categoryId: string }[],
  brands: { id: string; name: string }[],
  suppliers: { id: string; name: string }[],
  activeCount: number,
  inactiveCount: number
): { products: ProductCatalogItem[]; masterClasses: any[] } {
  
  // Base master list of Sri Lankan grocery products
  const productTemplates = [
    // Stable essentials (Grocery Essentials)
    { name: 'Keeri Samba Rice', sub: 'Rice & Grains', brand: 'Lanka Organics', unit: 'Kg', cost: 240, markup: 1.15, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 500, reorder: 100 },
    { name: 'White Raw Rice', sub: 'Rice & Grains', brand: 'Lanka Organics', unit: 'Kg', cost: 210, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 600, reorder: 120 },
    { name: 'Red Raw Rice', sub: 'Rice & Grains', brand: 'Harischandra', unit: 'Kg', cost: 220, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 400, reorder: 80 },
    { name: 'White Sugar', sub: 'Sugar & Sweeteners', brand: 'Maliban', unit: 'Kg', cost: 260, markup: 1.10, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 800, reorder: 150 },
    { name: 'Brown Sugar', sub: 'Sugar & Sweeteners', brand: 'Lanka Organics', unit: 'Kg', cost: 320, markup: 1.15, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 300, reorder: 60 },
    { name: 'Prima Wheat Flour', sub: 'Flours & Powders', brand: 'Prima', unit: 'Kg', cost: 180, markup: 1.10, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 500, reorder: 100 },
    { name: 'Harischandra Rice Flour', sub: 'Flours & Powders', brand: 'Harischandra', unit: 'Pkt', cost: 140, markup: 1.15, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 200, reorder: 50 },
    { name: 'Coconut Oil 1L', sub: 'Cooking Oils & Fats', brand: 'Lanka Organics', unit: 'Bottle', cost: 650, markup: 1.15, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 150, reorder: 30 },
    { name: 'Vegetable Oil 1L', sub: 'Cooking Oils & Fats', brand: 'Prima', unit: 'Bottle', cost: 580, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 150, reorder: 30 },
    
    // Dairy & Beverages
    { name: 'Anchor Milk Powder 400g', sub: 'Milk Powders', brand: 'Anchor', unit: 'Pkt', cost: 1050, markup: 1.08, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 300, reorder: 75, shelfLife: 365 },
    { name: 'Highland Milk Powder 400g', sub: 'Milk Powders', brand: 'Highland', unit: 'Pkt', cost: 980, markup: 1.07, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 300, reorder: 75, shelfLife: 365 },
    { name: 'Pelwatte Milk Powder 400g', sub: 'Milk Powders', brand: 'Maliban', unit: 'Pkt', cost: 950, markup: 1.07, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 200, reorder: 50, shelfLife: 365 },
    { name: 'Watawala Kahata Tea 200g', sub: 'Teas & Coffees', brand: 'Watawala', unit: 'Pkt', cost: 380, markup: 1.15, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 150, reorder: 40, shelfLife: 730 },
    { name: 'Dilmah Premium Tea 200g', sub: 'Teas & Coffees', brand: 'Dilmah', unit: 'Pkt', cost: 550, markup: 1.20, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 100, reorder: 25, shelfLife: 730 },
    { name: 'Nescafe Classic 50g', sub: 'Teas & Coffees', brand: 'Anchor', unit: 'Jar', cost: 720, markup: 1.18, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 80, reorder: 20, shelfLife: 730 },
    
    // Weekend-sensitive / Beverages & Snacks
    { name: 'Coca-Cola 1.5L', sub: 'Soft Drinks & Sodas', brand: 'Elephant House', unit: 'Bottle', cost: 310, markup: 1.15, profile: DemandProfileType.WEEKEND_SENSITIVE, cap: 200, reorder: 50, shelfLife: 180 },
    { name: 'Sprite 1.5L', sub: 'Soft Drinks & Sodas', brand: 'Elephant House', unit: 'Bottle', cost: 310, markup: 1.15, profile: DemandProfileType.WEEKEND_SENSITIVE, cap: 150, reorder: 40, shelfLife: 180 },
    { name: 'E/House Cream Soda 1.5L', sub: 'Soft Drinks & Sodas', brand: 'Elephant House', unit: 'Bottle', cost: 290, markup: 1.15, profile: DemandProfileType.WEEKEND_SENSITIVE, cap: 300, reorder: 80, shelfLife: 180 },
    { name: 'E/House Ginger Beer 1.5L', sub: 'Soft Drinks & Sodas', brand: 'Elephant House', unit: 'Bottle', cost: 300, markup: 1.15, profile: DemandProfileType.WEEKEND_SENSITIVE, cap: 250, reorder: 60, shelfLife: 180 },
    { name: 'Smak Mango Juice 200ml', sub: 'Fruit Juices', brand: 'Munchee', unit: 'Pkt', cost: 70, markup: 1.20, profile: DemandProfileType.WEEKEND_SENSITIVE, cap: 400, reorder: 100, shelfLife: 270 },
    { name: 'Orange Barley 1.5L', sub: 'Soft Drinks & Sodas', brand: 'Elephant House', unit: 'Bottle', cost: 280, markup: 1.15, profile: DemandProfileType.WEEKEND_SENSITIVE, cap: 150, reorder: 40, shelfLife: 180 },
    
    // Snacks / Confectionery
    { name: 'Munchee Cream Cracker 190g', sub: 'Savoury Crackers', brand: 'Munchee', unit: 'Pkt', cost: 170, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 400, reorder: 80, shelfLife: 240 },
    { name: 'Maliban Lemon Puff 200g', sub: 'Sweet Biscuits', brand: 'Maliban', unit: 'Pkt', cost: 180, markup: 1.12, profile: DemandProfileType.WEEKEND_SENSITIVE, cap: 300, reorder: 60, shelfLife: 240 },
    { name: 'Maliban Ginger Biscuits 200g', sub: 'Sweet Biscuits', brand: 'Maliban', unit: 'Pkt', cost: 160, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 250, reorder: 50, shelfLife: 240 },
    { name: 'Munchee Chocolate Biscuits 200g', sub: 'Sweet Biscuits', brand: 'Munchee', unit: 'Pkt', cost: 220, markup: 1.15, profile: DemandProfileType.DISCOUNT_SENSITIVE, cap: 200, reorder: 50, shelfLife: 240 },
    { name: 'Ritzbury Milk Chocolate 50g', sub: 'Chocolates & Candy', brand: 'Ritzbury', unit: 'Bar', cost: 150, markup: 1.20, profile: DemandProfileType.DISCOUNT_SENSITIVE, cap: 150, reorder: 30, shelfLife: 365 },
    { name: 'Kandos Milk Chocolate 100g', sub: 'Chocolates & Candy', brand: 'Ritzbury', unit: 'Bar', cost: 320, markup: 1.20, profile: DemandProfileType.DISCOUNT_SENSITIVE, cap: 100, reorder: 25, shelfLife: 365 },
    
    // Personal Care & Hygiene
    { name: 'Sunlight Soap 120g', sub: 'Bath Soaps & Washes', brand: 'Sunlight', unit: 'Bar', cost: 95, markup: 1.10, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 400, reorder: 80 },
    { name: 'Lifebuoy Total 100g', sub: 'Bath Soaps & Washes', brand: 'Sunlight', unit: 'Bar', cost: 110, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 300, reorder: 60 },
    { name: 'Velvet Rose & Milk 100g', sub: 'Bath Soaps & Washes', brand: 'Velvet', unit: 'Bar', cost: 120, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 250, reorder: 50 },
    { name: 'Sunsilk Shampoo 180ml', sub: 'Hair Care', brand: 'Sunlight', unit: 'Bottle', cost: 380, markup: 1.15, profile: DemandProfileType.DISCOUNT_SENSITIVE, cap: 100, reorder: 20, shelfLife: 1095 },
    { name: 'Signal Strong Teeth 120g', sub: 'Oral Care', brand: 'Signal', unit: 'Pkt', cost: 240, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 200, reorder: 40, shelfLife: 1095 },
    { name: 'Clogard Toothpaste 120g', sub: 'Oral Care', brand: 'Clogard', unit: 'Pkt', cost: 230, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 200, reorder: 40, shelfLife: 1095 },
    
    // Household & Cleaning
    { name: 'Sunlight Detergent Powder 1Kg', sub: 'Laundry Detergents', brand: 'Sunlight', unit: 'Pkt', cost: 550, markup: 1.12, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 150, reorder: 30 },
    { name: 'Diva Detergent Powder 1Kg', sub: 'Laundry Detergents', brand: 'Diva', unit: 'Pkt', cost: 480, markup: 1.10, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 150, reorder: 30 },
    { name: 'Vim Dishwash Bar 100g', sub: 'Dishwashers', brand: 'Sunlight', unit: 'Bar', cost: 65, markup: 1.10, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 400, reorder: 80 },
    { name: 'Flora Pocket Tissues x4', sub: 'Sanitary & Tissues', brand: 'Flora', unit: 'Pkt', cost: 180, markup: 1.20, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 150, reorder: 35 },
    
    // Seasonal (School & Baking & Apparel)
    { name: 'Atlas CR Book 80 pgs', sub: 'Exercise Books', brand: 'Atlas', unit: 'Book', cost: 120, markup: 1.25, profile: DemandProfileType.HIGHLY_SEASONAL, cap: 1000, reorder: 200, seasonal: 'SCHOOL_JAN' },
    { name: 'Richard Exercise Book 80 pgs', sub: 'Exercise Books', brand: 'Atlas', unit: 'Book', cost: 95, markup: 1.20, profile: DemandProfileType.HIGHLY_SEASONAL, cap: 1000, reorder: 200, seasonal: 'SCHOOL_JAN' },
    { name: 'Atlas Blue Gel Pen', sub: 'Writing Instruments', brand: 'Atlas', unit: 'Pcs', cost: 35, markup: 1.30, profile: DemandProfileType.HIGHLY_SEASONAL, cap: 2000, reorder: 300, seasonal: 'SCHOOL_JAN' },
    { name: 'Cake Vanilla Essence 20ml', sub: 'Cake Ingredients', brand: 'Harischandra', unit: 'Bottle', cost: 180, markup: 1.25, profile: DemandProfileType.HIGHLY_SEASONAL, cap: 200, reorder: 45, seasonal: 'FESTIVAL_DEC', shelfLife: 730 },
    { name: 'Baking Powder 100g', sub: 'Cake Ingredients', brand: 'Maliban', unit: 'Pkt', cost: 120, markup: 1.20, profile: DemandProfileType.HIGHLY_SEASONAL, cap: 150, reorder: 30, seasonal: 'FESTIVAL_DEC', shelfLife: 365 },
    { name: 'Rainco Classic Umbrella', sub: 'Umbrellas & Rainwear', brand: 'Rainco', unit: 'Pcs', cost: 1250, markup: 1.30, profile: DemandProfileType.HIGHLY_SEASONAL, cap: 100, reorder: 20, seasonal: 'RAINY_MAY_OCT' },
    
    // Fast Growing / New / Declining
    { name: 'Lanka Soy Chicken Flavor 90g', sub: 'Soya & Vegetarian', brand: 'Lanka Soy', unit: 'Pkt', cost: 110, markup: 1.15, profile: DemandProfileType.STABLE_ESSENTIAL, cap: 300, reorder: 60, shelfLife: 180 },
    { name: 'Harischandra Instant Noodles 350g', sub: 'Noodles & Pasta', brand: 'Harischandra', unit: 'Pkt', cost: 280, markup: 1.15, profile: DemandProfileType.FAST_GROWING, cap: 200, reorder: 50, shelfLife: 180 },
    { name: 'Prima Special Noodles 350g', sub: 'Noodles & Pasta', brand: 'Prima', unit: 'Pkt', cost: 290, markup: 1.15, profile: DemandProfileType.FAST_GROWING, cap: 250, reorder: 60, shelfLife: 180 },
    { name: 'Orange 9W LED Bulb', sub: 'Batteries & Bulbs', brand: 'Orange Electric', unit: 'Pcs', cost: 420, markup: 1.25, profile: DemandProfileType.SLOW_DECLINING, cap: 100, reorder: 20 },
    
    // Expiry Sensitive / Fresh food products
    { name: 'Fresh Milk 1L Tetra', sub: 'Milk Powders', brand: 'Highland', unit: 'Pkt', cost: 450, markup: 1.12, profile: DemandProfileType.EXPIRY_SENSITIVE, cap: 80, reorder: 20, shelfLife: 60 },
    { name: 'Ambewela Fresh Yogurt 80g', sub: 'Milk Powders', brand: 'Anchor', unit: 'Cup', cost: 80, markup: 1.15, profile: DemandProfileType.EXPIRY_SENSITIVE, cap: 150, reorder: 40, shelfLife: 21 },
    { name: 'Highland Salted Butter 200g', sub: 'Milk Powders', brand: 'Highland', unit: 'Pcs', cost: 720, markup: 1.12, profile: DemandProfileType.EXPIRY_SENSITIVE, cap: 80, reorder: 20, shelfLife: 90 },

    // Bulk Purchase
    { name: 'Munchee Biscuit Bulk Box', sub: 'Sweet Biscuits', brand: 'Munchee', unit: 'Box', cost: 3500, markup: 1.15, profile: DemandProfileType.BULK_PURCHASE_SENSITIVE, cap: 30, reorder: 8 },
    { name: 'Maliban Cracker Bulk Box', sub: 'Savoury Crackers', brand: 'Maliban', unit: 'Box', cost: 3200, markup: 1.12, profile: DemandProfileType.BULK_PURCHASE_SENSITIVE, cap: 30, reorder: 8 },

    // Intermittent
    { name: 'Heinz Tomato Ketchup Premium', sub: 'Rice & Grains', brand: 'Dilmah', unit: 'Bottle', cost: 1100, markup: 1.30, profile: DemandProfileType.INTERMITTENT, cap: 20, reorder: 5 },
    { name: 'Nutella Hazelnut Spread 350g', sub: 'Chocolates & Candy', brand: 'Ritzbury', unit: 'Jar', cost: 2400, markup: 1.25, profile: DemandProfileType.INTERMITTENT, cap: 15, reorder: 4 },

    // Combo sensitive
    { name: 'EH Ginger Beer Can 330ml', sub: 'Soft Drinks & Sodas', brand: 'Elephant House', unit: 'Can', cost: 160, markup: 1.18, profile: DemandProfileType.COMBO_SENSITIVE, cap: 200, reorder: 50, shelfLife: 180 },
    { name: 'Lanka Soy Curry Devilled 90g', sub: 'Soya & Vegetarian', brand: 'Lanka Soy', unit: 'Pkt', cost: 120, markup: 1.15, profile: DemandProfileType.COMBO_SENSITIVE, cap: 200, reorder: 50, shelfLife: 180 },
  ];

  const products: ProductCatalogItem[] = [];
  const masterClasses: any[] = [];
  const masterClassMap = new Map<string, string>(); // key: subCategoryId-brandId-supplierId -> masterClassId

  // Determine target counts
  const totalWanted = activeCount + inactiveCount;
  
  // Expand products if total wanted is higher than the templates
  let currentIdx = 0;
  for (let i = 0; i < totalWanted; i++) {
    const tmpl = productTemplates[i % productTemplates.length];
    
    // Add uniqueness if repeating templates
    const suffix = i >= productTemplates.length ? ` V${Math.floor(i / productTemplates.length)}` : '';
    const name = tmpl.name + suffix;

    // Resolve IDs
    const subCat = subCategories.find((s) => s.name === tmpl.sub) || subCategories[0];
    const brand = brands.find((b) => b.name === tmpl.brand) || brands[0];
    
    // Deterministically pick a supplier
    // Select supplier based on index
    const supplierHash = (subCat.name.length + brand.name.length + i) % suppliers.length;
    const supplier = suppliers[supplierHash];

    // Master Product Class lookup or create
    const mcKey = `${subCat.id}-${brand.id}-${supplier.id}`;
    let mcId = masterClassMap.get(mcKey);
    if (!mcId) {
      mcId = `mc-${(masterClassMap.size + 1).toString().padStart(3, '0')}`;
      masterClassMap.set(mcKey, mcId);
      masterClasses.push({
        id: mcId,
        name: `${brand.name} ${subCat.name} Class`,
        categoryId: subCat.categoryId,
        subCategoryId: subCat.id,
        brandId: brand.id,
        supplierId: supplier.id,
        hasVariant: false,
        createdAt: new Date('2022-01-01T00:00:00Z'),
      });
    }

    // SKU Generation
    const cleanBrand = brand.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    const cleanProd = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const sku = `${cleanBrand}-${cleanProd}-${tmpl.unit.toUpperCase()}-${i.toString().padStart(4, '0')}`;

    // Barcode Generation (deterministic based on index)
    const baseBarcode = (479100000000 + i).toString();
    let barcodeSum = 0;
    for (let c = 0; c < 12; c++) {
      barcodeSum += parseInt(baseBarcode[c]) * (c % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (barcodeSum % 10)) % 10;
    const barcode = `${baseBarcode}${checkDigit}`;

    // Launch date and Status logic
    let status: ProductStatus = ProductStatus.ACTIVE;
    let launchDate = new Date('2022-12-01T00:00:00Z'); // default launched before simulation start
    let discontinuationDate: Date | null = null;
    let profile = tmpl.profile;

    if (i >= activeCount) {
      // These are inactive or discontinued
      const isDiscontinued = i % 2 === 0;
      status = isDiscontinued ? ProductStatus.DISCONTINUED : ProductStatus.INACTIVE;
      
      if (isDiscontinued) {
        // Discontinued halfway through simulation
        discontinuationDate = new Date('2024-06-30T00:00:00Z');
      } else {
        // Inactive since late 2024
        discontinuationDate = new Date('2024-11-15T00:00:00Z');
      }
    } else {
      // Active products
      // Introduce some "new products" launched in 2025 (limited history)
      if (profile === DemandProfileType.NEW_PRODUCT || (i % 10 === 0 && i > 0)) {
        profile = DemandProfileType.NEW_PRODUCT;
        // Deterministic launch date in 2025 (e.g. Feb 15, June 1, Oct 10)
        const launchMonths = [1, 5, 9]; // index 0 = Feb, 1 = June, 2 = Oct
        const chosenMonth = launchMonths[i % launchMonths.length];
        launchDate = new Date(Date.UTC(2025, chosenMonth, 15));
      }
    }

    products.push({
      sku,
      name,
      masterId: mcId,
      barcode,
      subCategoryId: subCat.id,
      brandId: brand.id,
      supplierId: supplier.id,
      unitType: tmpl.unit,
      costPrice: tmpl.cost,
      sellingPrice: Math.round(tmpl.cost * tmpl.markup),
      reorderLevel: tmpl.reorder,
      targetCapacity: tmpl.cap,
      status,
      demandProfile: profile,
      seasonal: tmpl.seasonal || null,
      launchDate,
      discontinuationDate,
      shelfLifeDays: tmpl.shelfLife,
    });
  }

  return { products, masterClasses };
}
