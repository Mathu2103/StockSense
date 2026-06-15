import { api } from '../../../../services/axiosInstance';

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

const mapBackendProductToFrontend = (p: any): ProductItem => ({
  id: p.sku,
  name: p.name,
  sku: p.sku,
  barcode: p.barcode,
  category: p.masterClass?.category?.name || 'General',
  subcategory: p.masterClass?.subCategory?.name || undefined,
  supplier: p.masterClass?.supplier?.name || 'N/A',
  brand: p.masterClass?.brand?.name || 'N/A',
  unitType: p.unitType,
  stock: p.currentStock,
  reorderLevel: p.reorderLevel,
  targetCapacity: p.targetCapacity,
  costPrice: p.costPrice,
  sellingPrice: p.sellingPrice,
  status: p.status === 'ACTIVE' ? 'Active' : 'Inactive',
  lastUpdated: new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  imageUrl: p.imageUrl,
  description: p.masterClass?.description || undefined,
  mfgDate: p.mfgDate ? p.mfgDate.split('T')[0] : undefined,
  expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : undefined,
});

export const inventoryOperationsService = {
  // Products Catalog API
  getProducts: async (): Promise<ProductItem[]> => {
    try {
      const res = await api.get('/products');
      if (res.data && res.data.success) {
        return res.data.data.map(mapBackendProductToFrontend);
      }
      return [];
    } catch (err) {
      console.error('Error fetching products from backend:', err);
      return [];
    }
  },

  updateProductStock: async (sku: string, qtyToAddOrSubtract: number): Promise<ProductItem | null> => {
    try {
      const productsRes = await api.get('/products');
      const dbProducts = productsRes.data.data;
      const prod = dbProducts.find((p: any) => p.sku === sku);
      if (!prod) return null;

      const newStock = Math.max(0, prod.currentStock + qtyToAddOrSubtract);
      const updateRes = await api.put(`/products/${sku}`, {
        ...prod,
        currentStock: newStock
      });
      
      if (updateRes.data && updateRes.data.success) {
        const updated = Array.isArray(updateRes.data.data) ? updateRes.data.data[0] : updateRes.data.data;
        return mapBackendProductToFrontend(updated);
      }
      return null;
    } catch (err) {
      console.error('Error updating product stock:', err);
      return null;
    }
  },

  // GRN History API
  getGRNHistory: async (): Promise<GRNRecord[]> => {
    try {
      const res = await api.get('/inventory/grns');
      if (res.data && res.data.success) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching GRNs from backend:', err);
      return [];
    }
  },

  createGRN: async (grn: Omit<GRNRecord, 'id' | 'grnNumber' | 'accuracyScore' | 'status'>): Promise<GRNRecord> => {
    try {
      const res = await api.post('/inventory/grns', grn);
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to create GRN');
    } catch (err: any) {
      console.error('Error creating GRN on backend:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create GRN');
    }
  },

  // Unified Ledger API
  getLedger: async (): Promise<LedgerEntry[]> => {
    try {
      const res = await api.get('/inventory/ledger');
      if (res.data && res.data.success) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching ledger from backend:', err);
      return [];
    }
  },

  addLedgerEntry: async (entry: Omit<LedgerEntry, 'id' | 'timestamp'>): Promise<LedgerEntry> => {
    return {
      ...entry,
      id: `led-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  },

  // Stock Adjustments API
  getAdjustments: async (): Promise<AdjustmentRecord[]> => {
    try {
      const res = await api.get('/inventory/adjustments');
      if (res.data && res.data.success) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching adjustments from backend:', err);
      return [];
    }
  },

  createAdjustment: async (adj: Omit<AdjustmentRecord, 'id' | 'adjustmentNumber' | 'totalValue' | 'beforeStock' | 'afterStock' | 'status'>): Promise<AdjustmentRecord> => {
    try {
      const res = await api.post('/inventory/adjustments', adj);
      if (res.data && res.data.success) {
        return res.data.data;
      }
      throw new Error(res.data?.message || 'Failed to create stock adjustment');
    } catch (err: any) {
      console.error('Error creating adjustment on backend:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create stock adjustment');
    }
  },

  // ── Sales Velocity Analysis ────────────────────────────────────────────────
  getSalesVelocity: async (analysisDays = 30): Promise<Record<string, {
    sku: string;
    productName: string;
    lastSaleDate: string | null;
    daysSinceLastSale: number;
    totalUnitsSold: number;
    totalSaleEvents: number;
    avgUnitsPerDay: number;
    velocityLabel: 'Never Sold' | 'Dead Stock' | 'Slow Moving' | 'Normal' | 'Fast Moving';
  }>> => {
    try {
      const [ledgerRes, productsRes] = await Promise.all([
        api.get('/inventory/ledger'),
        api.get('/products')
      ]);
      
      const ledger = (ledgerRes.data && ledgerRes.data.success) ? ledgerRes.data.data : [];
      const products = (productsRes.data && productsRes.data.success) ? productsRes.data.data.map(mapBackendProductToFrontend) : [];

      const now = Date.now();
      const windowMs = analysisDays * 24 * 60 * 60 * 1000;
      const windowStart = now - windowMs;

      const result: Record<string, any> = {};

      products.forEach((p: ProductItem) => {
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

      const saleEntries = ledger.filter((e: LedgerEntry) => e.movementType === 'Sale');

      saleEntries.forEach((entry: LedgerEntry) => {
        const entryTime = new Date(entry.timestamp).getTime();
        const rec = result[entry.sku];
        if (!rec) return;

        if (!rec.lastSaleDate || entryTime > new Date(rec.lastSaleDate).getTime()) {
          rec.lastSaleDate = entry.timestamp;
          rec.daysSinceLastSale = Math.floor((now - entryTime) / (1000 * 60 * 60 * 24));
        }

        if (entryTime >= windowStart) {
          rec.totalUnitsSold += Math.abs(entry.quantityChange);
          rec.totalSaleEvents += 1;
        }
      });

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
    } catch (err) {
      console.error('Error running sales velocity analysis:', err);
      return {};
    }
  }
};
