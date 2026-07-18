import { AdjustmentReason } from '@prisma/client';
import { SeededRandom } from './deterministic-random.js';
import { ProductCatalogItem } from './product-catalog.js';

export interface StockAdjustmentInput {
  id: string;
  sku: string;
  qtyChanged: number;
  reason: AdjustmentReason;
  adjustedById: string;
  finalQuantity: number;
  createdAt: Date;
}

let adjustmentCounter = 0;

export function generateDailyAdjustments(
  date: Date,
  products: ProductCatalogItem[],
  runningStock: Map<string, number>,
  userIds: string[],
  random: SeededRandom
): StockAdjustmentInput[] {
  const adjustments: StockAdjustmentInput[] = [];

  // Low probability of adjustment per day (e.g. 10% chance to have some adjustments on a day)
  if (random.next() > 0.1) return adjustments;

  // Filter products launched and active today
  const activeProducts = products.filter(
    (p: ProductCatalogItem) => date >= p.launchDate && (!p.discontinuationDate || date < p.discontinuationDate)
  );

  if (activeProducts.length === 0) return adjustments;

  // Generate 1 to 3 adjustments on this day
  const adjustmentCount = random.nextInt(1, 3);
  const chosenProducts = random.pickN(activeProducts, adjustmentCount);

  chosenProducts.forEach((prod: ProductCatalogItem) => {
    const currentStock = runningStock.get(prod.sku) || 0;
    if (currentStock <= 0) return;

    // Pick a reason
    const reasons: AdjustmentReason[] = [
      AdjustmentReason.DAMAGED,
      AdjustmentReason.LOST,
      AdjustmentReason.COUNTING_ERROR,
      AdjustmentReason.SYSTEM_CORRECTION,
    ];

    // Only allow EXPIRED for expiry sensitive products
    if (prod.shelfLifeDays) {
      reasons.push(AdjustmentReason.EXPIRED);
    }

    const reason = random.pick(reasons);
    let qtyChanged = 0;

    if (reason === AdjustmentReason.DAMAGED || reason === AdjustmentReason.LOST || reason === AdjustmentReason.EXPIRED) {
      // Negative adjustment
      qtyChanged = -random.nextInt(1, Math.min(5, currentStock));
    } else if (reason === AdjustmentReason.COUNTING_ERROR || reason === AdjustmentReason.SYSTEM_CORRECTION) {
      // Can be positive or negative
      qtyChanged = random.next() < 0.5 ? -random.nextInt(1, Math.min(3, currentStock)) : random.nextInt(1, 3);
    }

    if (qtyChanged === 0) return;

    const finalQuantity = currentStock + qtyChanged;
    if (finalQuantity < 0) return; // double check no negative stock

    // Update running stock
    runningStock.set(prod.sku, finalQuantity);

    adjustmentCounter++;

    const adjTime = new Date(date);
    adjTime.setUTCHours(random.nextInt(9, 17), random.nextInt(0, 59));

    adjustments.push({
      id: `adj-uuid-${adjustmentCounter}`,
      sku: prod.sku,
      qtyChanged,
      reason,
      adjustedById: random.pick(userIds),
      finalQuantity,
      createdAt: adjTime,
    });
  });

  return adjustments;
}
