import { SeededRandom } from './deterministic-random.js';
import { ProductCatalogItem } from './product-catalog.js';

export interface GrnInput {
  id: string;
  grnId: string;
  supplierId: string;
  operatorId: string;
  grnDate: Date;
  notes: string | null;
}

export interface GrnItemInput {
  id: string;
  grnId: string;
  sku: string;
  addedQuantity: number;
  finalQuantity: number;
  unitCost: number;
  mfd: Date | null;
  epd: Date | null;
}

let grnCounter = 0;

export function createRestockGrn(
  date: Date,
  supplierId: string,
  operatorId: string,
  restockItems: { product: ProductCatalogItem; currentStock: number; addedQty: number }[],
  random: SeededRandom
): { grn: GrnInput; grnItems: GrnItemInput[] } {
  grnCounter++;
  const grnId = `GRN-${date.getUTCFullYear()}-${grnCounter.toString().padStart(6, '0')}`;
  const dbGrnId = `grn-uuid-${grnCounter}`;

  const grn: GrnInput = {
    id: dbGrnId,
    grnId,
    supplierId,
    operatorId,
    grnDate: date,
    notes: `Restock shipment received on ${date.toISOString().split('T')[0]}`,
  };

  let itemIdx = 0;
  const grnItems: GrnItemInput[] = restockItems.map((item) => {
    itemIdx++;
    const finalQty = item.currentStock + item.addedQty;
    
    // Manufacturing date is 5 to 15 days before GRN date
    const mfd = new Date(date);
    mfd.setUTCDate(mfd.getUTCDate() - random.nextInt(5, 15));

    // Expiry date is based on shelf life
    let epd: Date | null = null;
    if (item.product.shelfLifeDays) {
      epd = new Date(mfd);
      epd.setUTCDate(epd.getUTCDate() + item.product.shelfLifeDays);
    }

    return {
      id: `grni-uuid-${grnCounter}-${itemIdx}`,
      grnId: dbGrnId,
      sku: item.product.sku,
      addedQuantity: item.addedQty,
      finalQuantity: finalQty,
      unitCost: item.product.costPrice,
      mfd,
      epd,
    };
  });

  return { grn, grnItems };
}
