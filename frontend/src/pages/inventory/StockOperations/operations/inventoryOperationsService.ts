export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory?: string;
  supplier: string;
  brand: string;
  unitType: string;
  stock: number;
  reorderLevel: number;
  targetCapacity?: number;
  costPrice: number;
  sellingPrice: number;
  status: string;
  lastUpdated: string;
  imageUrl?: string | null;
  description?: string;
  mfgDate?: string;
  expiryDate?: string;
}

export interface GRNItem {
  productName: string;
  sku: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  mfgDate: string;
  expiryDate: string;
}

export interface GRNRecord {
  id: string;
  grnNumber: string;
  supplierName: string;
  receivedDate: string;
  items: GRNItem[];
  totalQuantity: number;
  totalCost: number;
  status: 'Completed' | 'Shortage' | 'Over Delivery';
  accuracyScore: number; // Percentage
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  productName: string;
  sku: string;
  movementType: 'GRN' | 'Sale' | 'Adjustment' | 'Expiry Removal' | 'Supplier Return';
  quantityChange: number; // positive or negative
  beforeStock: number;
  afterStock: number;
  reason: string;
  user: string;
  status: 'Success' | 'Warning' | 'Critical';
}

export interface AdjustmentRecord {
  id: string;
  adjustmentNumber: string;
  productName: string;
  sku: string;
  qtyChanged: number;
  reason: 'Damaged' | 'Lost' | 'Expired' | 'Returned' | 'Counting error' | 'System correction';
  adjustedBy: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Needs Review';
  totalValue: number;
  beforeStock: number;
  afterStock: number;
}

const PRODUCT_KEY = 'stocksense_product_catalog_products';
const GRN_KEY = 'stocksense_grn_records';
const LEDGER_KEY = 'stocksense_ledger_records';
const ADJUSTMENT_KEY = 'stocksense_adjustments_records';

// Load products, categories, suppliers matching Specification preloads
const initialProducts: ProductItem[] = [
  {
    id: '1',
    name: 'Anchor Milk Powder 400g',
    sku: 'DAI-005',
    barcode: '4790012948577',
    category: 'Dairy',
    subcategory: 'Milk Products',
    supplier: 'FreshFarm Supplies',
    brand: 'Anchor',
    unitType: 'Pack',
    stock: 240,
    reorderLevel: 30,
    targetCapacity: 400,
    costPrice: 450.00,
    sellingPrice: 520.00,
    status: 'Active',
    description: 'Premium milk powder manufactured in New Zealand.',
    mfgDate: '2026-04-10',
    expiryDate: '2027-04-10',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Ceylon Beverage Distributors Coca-Cola 1L',
    sku: 'BEV-001',
    barcode: '0038847291101',
    category: 'Beverages',
    subcategory: 'Soft Drinks',
    supplier: 'Ceylon Beverage Distributors',
    brand: 'Coca-Cola',
    unitType: 'Bottle',
    stock: 8,
    reorderLevel: 15,
    targetCapacity: 60,
    costPrice: 120.00,
    sellingPrice: 150.00,
    status: 'Active',
    description: 'Refreshing carbonated soft drink bottle.',
    mfgDate: '2026-05-01',
    expiryDate: '2026-11-01',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Sunlight Soap',
    sku: 'HOU-012',
    barcode: '0099221188334',
    category: 'Household',
    subcategory: 'Detergents & Soaps',
    supplier: 'FreshFarm Supplies',
    brand: 'Sunlight',
    unitType: 'Piece',
    stock: 142,
    reorderLevel: 25,
    targetCapacity: 100,
    costPrice: 85.00,
    sellingPrice: 105.00,
    status: 'Active',
    description: 'Multi-purpose household laundry soap cake.',
    mfgDate: '2026-03-20',
    expiryDate: '2028-03-20',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1607006342411-b01354cc792a?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Signal Toothpaste',
    sku: 'GRO-009',
    barcode: '0044556677882',
    category: 'Grocery',
    subcategory: 'Spices & Condiments',
    supplier: 'FreshFarm Supplies',
    brand: 'Signal',
    unitType: 'Piece',
    stock: 0,
    reorderLevel: 20,
    targetCapacity: 80,
    costPrice: 140.00,
    sellingPrice: 175.00,
    status: 'Active',
    description: 'Double active fluoride toothpaste.',
    mfgDate: '2026-02-12',
    expiryDate: '2028-02-12',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Munchee Chocolate Biscuit',
    sku: 'GRO-042',
    barcode: '4790012948600',
    category: 'Grocery',
    subcategory: 'Biscuits & Snacks',
    supplier: 'Ceylon Beverage Distributors',
    brand: 'Munchee',
    unitType: 'Pack',
    stock: 90,
    reorderLevel: 15,
    targetCapacity: 60,
    costPrice: 180.00,
    sellingPrice: 210.00,
    status: 'Active',
    description: 'Crispy chocolate biscuits.',
    mfgDate: '2026-05-10',
    expiryDate: '2026-11-10',
    lastUpdated: 'May 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=200&auto=format&fit=crop'
  }
];

const initialGRNs: GRNRecord[] = [
  {
    id: 'grn_1',
    grnNumber: 'GRN-2026-001',
    supplierName: 'FreshFarm Supplies',
    receivedDate: '2026-05-28',
    items: [
      { productName: 'Anchor Milk Powder 400g', sku: 'DAI-005', orderedQty: 100, receivedQty: 100, unitCost: 450, mfgDate: '2026-04-10', expiryDate: '2027-04-10' },
      { productName: 'Signal Toothpaste', sku: 'GRO-009', orderedQty: 50, receivedQty: 48, unitCost: 140, mfgDate: '2026-02-12', expiryDate: '2028-02-12' }
    ],
    totalQuantity: 148,
    totalCost: 51720,
    status: 'Shortage',
    accuracyScore: 98,
    notes: '2 units of Toothpaste damaged in transit and rejected.'
  },
  {
    id: 'grn_2',
    grnNumber: 'GRN-2026-002',
    supplierName: 'Ceylon Beverage Distributors',
    receivedDate: '2026-05-29',
    items: [
      { productName: 'Coca-Cola 1L', sku: 'BEV-001', orderedQty: 50, receivedQty: 50, unitCost: 120, mfgDate: '2026-05-01', expiryDate: '2026-11-01' }
    ],
    totalQuantity: 50,
    totalCost: 6000,
    status: 'Completed',
    accuracyScore: 100,
    notes: 'Delivery completely clean.'
  }
];

const initialLedger: LedgerEntry[] = [
  {
    id: 'led_1',
    timestamp: '2026-05-28T09:15:00Z',
    productName: 'Anchor Milk Powder 400g',
    sku: 'DAI-005',
    movementType: 'GRN',
    quantityChange: 100,
    beforeStock: 140,
    afterStock: 240,
    reason: 'Purchase order received',
    user: 'Alex Rivera',
    status: 'Success'
  },
  {
    id: 'led_2',
    timestamp: '2026-05-28T10:45:00Z',
    productName: 'Signal Toothpaste',
    sku: 'GRO-009',
    movementType: 'GRN',
    quantityChange: 48,
    beforeStock: 0,
    afterStock: 48,
    reason: 'Purchase order received (2 short)',
    user: 'Alex Rivera',
    status: 'Warning'
  },
  {
    id: 'led_3',
    timestamp: '2026-05-29T14:30:00Z',
    productName: 'Coca-Cola 1L',
    sku: 'BEV-001',
    movementType: 'Sale',
    quantityChange: -12,
    beforeStock: 20,
    afterStock: 8,
    reason: 'POS Sale Checkout',
    user: 'Cashier_01',
    status: 'Success'
  },
  {
    id: 'led_4',
    timestamp: '2026-05-29T16:15:00Z',
    productName: 'Munchee Chocolate Biscuit',
    sku: 'GRO-042',
    movementType: 'Expiry Removal',
    quantityChange: -5,
    beforeStock: 95,
    afterStock: 90,
    reason: 'Removed expired batches',
    user: 'Jane Doe',
    status: 'Critical'
  }
];

const initialAdjustments: AdjustmentRecord[] = [
  {
    id: 'adj_1',
    adjustmentNumber: 'ADJ-2026-001',
    productName: 'Munchee Chocolate Biscuit',
    sku: 'GRO-042',
    qtyChanged: -5,
    reason: 'Expired',
    adjustedBy: 'Jane Doe',
    date: '2026-05-29',
    status: 'Approved',
    totalValue: 900,
    beforeStock: 95,
    afterStock: 90
  }
];

const memoryStore: Record<string, any[]> = {};

// Helper database loaders
function load<T>(key: string, initial: T[]): T[] {
  if (!memoryStore[key]) {
    memoryStore[key] = [...initial];
  }
  return memoryStore[key];
}

function save<T>(key: string, data: T[]) {
  memoryStore[key] = [...data];
}

export const inventoryOperationsService = {
  // Products Catalog API
  getProducts: async (): Promise<ProductItem[]> => {
    return load(PRODUCT_KEY, initialProducts);
  },

  updateProductStock: async (sku: string, qtyToAddOrSubtract: number): Promise<ProductItem | null> => {
    const products = load<ProductItem>(PRODUCT_KEY, initialProducts);
    const index = products.findIndex(p => p.sku === sku);
    if (index === -1) return null;

    const p = products[index];
    const before = p.stock;
    const after = Math.max(0, before + qtyToAddOrSubtract);
    p.stock = after;
    p.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    save(PRODUCT_KEY, products);
    return p;
  },

  // GRN History API
  getGRNHistory: async (): Promise<GRNRecord[]> => {
    return load(GRN_KEY, initialGRNs).reverse(); // Newest first
  },

  createGRN: async (grn: Omit<GRNRecord, 'id' | 'grnNumber' | 'accuracyScore' | 'status'>): Promise<GRNRecord> => {
    const grns = load<GRNRecord>(GRN_KEY, initialGRNs);
    const grnNumber = `GRN-2026-${String(grns.length + 1).padStart(3, '0')}`;

    // Calculate total quantity & cost & shortage/over accuracy
    let totalQuantity = 0;
    let totalCost = 0;
    let hasShortage = false;
    let hasOverDelivery = false;
    let matchedLines = 0;

    grn.items.forEach(item => {
      totalQuantity += item.receivedQty;
      totalCost += item.receivedQty * item.unitCost;
      if (item.receivedQty < item.orderedQty) hasShortage = true;
      if (item.receivedQty > item.orderedQty) hasOverDelivery = true;
      if (item.receivedQty === item.orderedQty) matchedLines++;
    });

    const accuracyScore = grn.items.length > 0 ? Math.round((matchedLines / grn.items.length) * 100) : 100;
    const status = hasOverDelivery ? 'Over Delivery' : (hasShortage ? 'Shortage' : 'Completed');

    const newGRN: GRNRecord = {
      ...grn,
      id: `grn_${Date.now()}`,
      grnNumber,
      totalQuantity,
      totalCost,
      status,
      accuracyScore
    };

    grns.push(newGRN);
    save(GRN_KEY, grns);

    // Update active inventory stocks & ledger entries
    const products = load<ProductItem>(PRODUCT_KEY, initialProducts);
    for (const item of grn.items) {
      const pIndex = products.findIndex(p => p.sku === item.sku);
      if (pIndex !== -1) {
        const p = products[pIndex];
        const before = p.stock;
        const after = before + item.receivedQty;
        p.stock = after;
        p.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Add ledger record
        const ledger = load<LedgerEntry>(LEDGER_KEY, initialLedger);
        ledger.push({
          id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          productName: item.productName,
          sku: item.sku,
          movementType: 'GRN',
          quantityChange: item.receivedQty,
          beforeStock: before,
          afterStock: after,
          reason: `Goods Received via ${grnNumber} from ${grn.supplierName}`,
          user: 'Inventory Manager',
          status: item.receivedQty < item.orderedQty ? 'Warning' : 'Success'
        });
        save(LEDGER_KEY, ledger);
      }
    }
    save(PRODUCT_KEY, products);

    return newGRN;
  },

  // Unified Ledger API
  getLedger: async (): Promise<LedgerEntry[]> => {
    return load(LEDGER_KEY, initialLedger).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  addLedgerEntry: async (entry: Omit<LedgerEntry, 'id' | 'timestamp'>): Promise<LedgerEntry> => {
    const ledger = load<LedgerEntry>(LEDGER_KEY, initialLedger);
    const newEntry: LedgerEntry = {
      ...entry,
      id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    ledger.push(newEntry);
    save(LEDGER_KEY, ledger);
    return newEntry;
  },

  // Stock Adjustments API
  getAdjustments: async (): Promise<AdjustmentRecord[]> => {
    return load(ADJUSTMENT_KEY, initialAdjustments).reverse();
  },

  createAdjustment: async (adj: Omit<AdjustmentRecord, 'id' | 'adjustmentNumber' | 'totalValue' | 'beforeStock' | 'afterStock' | 'status'>): Promise<AdjustmentRecord> => {
    const adjustments = load<AdjustmentRecord>(ADJUSTMENT_KEY, initialAdjustments);
    const adjustmentNumber = `ADJ-2026-${String(adjustments.length + 1).padStart(3, '0')}`;

    // Read current stock
    const products = load<ProductItem>(PRODUCT_KEY, initialProducts);
    const pIndex = products.findIndex(p => p.sku === adj.sku);
    if (pIndex === -1) throw new Error('Product not found in registry');

    const p = products[pIndex];
    const beforeStock = p.stock;
    const afterStock = Math.max(0, beforeStock + adj.qtyChanged);
    p.stock = afterStock;
    p.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    save(PRODUCT_KEY, products);

    const totalValue = Math.abs(adj.qtyChanged * p.sellingPrice);

    // Set approval workflow status: larger discrepancies require double verification/needs review
    const isCritical = Math.abs(adj.qtyChanged) >= 50 || totalValue >= 5000;
    const status = isCritical ? 'Needs Review' : 'Approved';

    const newAdj: AdjustmentRecord = {
      ...adj,
      id: `adj_${Date.now()}`,
      adjustmentNumber,
      totalValue,
      beforeStock,
      afterStock,
      status
    };

    adjustments.push(newAdj);
    save(ADJUSTMENT_KEY, adjustments);

    // Write to Unified Ledger
    const ledger = load<LedgerEntry>(LEDGER_KEY, initialLedger);
    ledger.push({
      id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      productName: adj.productName,
      sku: adj.sku,
      movementType: adj.reason === 'Expired' ? 'Expiry Removal' : 'Adjustment',
      quantityChange: adj.qtyChanged,
      beforeStock,
      afterStock,
      reason: `Manual Correction: ${adj.reason} (${adjustmentNumber})`,
      user: adj.adjustedBy,
      status: isCritical ? 'Critical' : 'Success'
    });
    save(LEDGER_KEY, ledger);

    return newAdj;
  },

  // ── Sales Velocity Analysis ────────────────────────────────────────────────
  // Returns per-SKU velocity data for dead/slow stock detection
  getSalesVelocity: async (analysisDays = 30): Promise<Record<string, {
    sku: string;
    productName: string;
    lastSaleDate: string | null;      // ISO string of last Sale entry
    daysSinceLastSale: number;        // days since last Sale (Infinity if never sold)
    totalUnitsSold: number;           // units sold in analysisDays window
    totalSaleEvents: number;          // number of separate sale transactions
    avgUnitsPerDay: number;           // average daily sales velocity
    velocityLabel: 'Never Sold' | 'Dead Stock' | 'Slow Moving' | 'Normal' | 'Fast Moving';
  }>> => {
    const ledger = load<LedgerEntry>(LEDGER_KEY, initialLedger);
    const products = load<ProductItem>(PRODUCT_KEY, initialProducts);

    const now = Date.now();
    const windowMs = analysisDays * 24 * 60 * 60 * 1000;
    const windowStart = now - windowMs;

    const result: Record<string, any> = {};

    // Initialize with all products
    products.forEach(p => {
      result[p.sku] = {
        sku: p.sku,
        productName: p.name,
        lastSaleDate: null,
        daysSinceLastSale: Infinity,
        totalUnitsSold: 0,
        totalSaleEvents: 0,
        avgUnitsPerDay: 0,
        velocityLabel: 'Never Sold',
      };
    });

    // Process only Sale entries
    const saleEntries = ledger.filter(e => e.movementType === 'Sale');

    saleEntries.forEach(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      const rec = result[entry.sku];
      if (!rec) return;

      // Track last sale date (most recent)
      if (!rec.lastSaleDate || entryTime > new Date(rec.lastSaleDate).getTime()) {
        rec.lastSaleDate = entry.timestamp;
        rec.daysSinceLastSale = Math.floor((now - entryTime) / (1000 * 60 * 60 * 24));
      }

      // Accumulate units sold within the analysis window
      if (entryTime >= windowStart) {
        rec.totalUnitsSold += Math.abs(entry.quantityChange);
        rec.totalSaleEvents += 1;
      }
    });

    // Calculate velocity labels and avg units/day
    Object.values(result).forEach((rec: any) => {
      rec.avgUnitsPerDay = rec.totalUnitsSold / analysisDays;

      if (rec.daysSinceLastSale === Infinity) {
        rec.velocityLabel = 'Never Sold';
      } else if (rec.daysSinceLastSale > 30) {
        rec.velocityLabel = 'Dead Stock';
      } else if (rec.daysSinceLastSale > 14 && rec.avgUnitsPerDay < 1) {
        rec.velocityLabel = 'Slow Moving';
      } else if (rec.avgUnitsPerDay >= 10) {
        rec.velocityLabel = 'Fast Moving';
      } else {
        rec.velocityLabel = 'Normal';
      }
    });

    return result;
  }
};

