import { DiscountType, ApprovalStatus } from '@prisma/client';
import { SeededRandom } from './deterministic-random.js';
import { ProductCatalogItem } from './product-catalog.js';

export interface DiscountInput {
  id: string;
  name: string;
  type: DiscountType;
  discountValue: number;
  comboPrice: number | null;
  minBillAmount: number | null;
  label: string | null;
  startDate: Date | null;
  endDate: Date | null;
  dailyStartTime: string | null;
  dailyEndTime: string | null;
  applicableDate: Date | null;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
}

export interface DiscountProductInput {
  id: string;
  discountId: string;
  sku: string;
}

export interface DiscountComboItemInput {
  id: string;
  discountId: string;
  sku: string;
  minQty: number;
}

export function generateDiscounts(
  random: SeededRandom,
  products: ProductCatalogItem[]
) {
  const discounts: DiscountInput[] = [];
  const discountProducts: DiscountProductInput[] = [];
  const discountComboItems: DiscountComboItemInput[] = [];

  // Helper to generate UUID-like IDs
  let dpCount = 0;
  let dciCount = 0;

  // Let's create seasonal campaigns for 2023, 2024, 2025, 2026
  const years = [2023, 2024, 2025, 2026];

  years.forEach((year) => {
    const isCurrentYear = year === 2026;

    // 1. School Season Promotion (January 1 to January 20)
    // Affects School Supplies (seasonal: 'SCHOOL_JAN')
    const schoolDiscId = `disc-school-${year}`;
    discounts.push({
      id: schoolDiscId,
      name: `School Season Back to School ${year}`,
      type: DiscountType.SEASONAL,
      discountValue: 15, // 15% discount
      comboPrice: null,
      minBillAmount: null,
      label: 'BACKTOSCHOOL',
      startDate: new Date(`${year}-01-01T00:00:00Z`),
      endDate: new Date(`${year}-01-20T23:59:59Z`),
      dailyStartTime: null,
      dailyEndTime: null,
      applicableDate: null,
      isActive: false, // January is past in 2026
      approvalStatus: ApprovalStatus.APPROVED,
    });

    // 2. Sinhala/Tamil New Year Sale (April 5 to April 16)
    // Affects general essentials and snack items
    const newYearDiscId = `disc-avurudu-${year}`;
    discounts.push({
      id: newYearDiscId,
      name: `Avurudu Festival Offers ${year}`,
      type: DiscountType.SEASONAL,
      discountValue: 10,
      comboPrice: null,
      minBillAmount: null,
      label: 'AVURUDU10',
      startDate: new Date(`${year}-04-05T00:00:00Z`),
      endDate: isCurrentYear ? new Date(`2026-12-31T23:59:59Z`) : new Date(`${year}-04-16T23:59:59Z`),
      dailyStartTime: null,
      dailyEndTime: null,
      applicableDate: null,
      isActive: isCurrentYear,
      approvalStatus: ApprovalStatus.APPROVED,
    });

    // 3. August Harvest & Festival Special 2026 (Active Current Season)
    if (isCurrentYear) {
      const augustDiscId = `disc-august-${year}`;
      discounts.push({
        id: augustDiscId,
        name: `August Festival & Super Harvest Deals ${year}`,
        type: DiscountType.SEASONAL,
        discountValue: 12,
        comboPrice: null,
        minBillAmount: null,
        label: 'HARVEST12',
        startDate: new Date(`2026-08-01T00:00:00Z`),
        endDate: new Date(`2026-08-31T23:59:59Z`),
        dailyStartTime: null,
        dailyEndTime: null,
        applicableDate: null,
        isActive: true,
        approvalStatus: ApprovalStatus.APPROVED,
      });
    }

    // 4. December Cake Festival (November 15 to December 31)
    // Affects Cake Ingredients (seasonal: 'FESTIVAL_DEC')
    const cakeDiscId = `disc-cake-${year}`;
    discounts.push({
      id: cakeDiscId,
      name: `Christmas Baking Bonanza ${year}`,
      type: DiscountType.SEASONAL,
      discountValue: 20, // 20% discount
      comboPrice: null,
      minBillAmount: null,
      label: 'XMASBAKING',
      startDate: new Date(`${year}-11-15T00:00:00Z`),
      endDate: new Date(`${year}-12-31T23:59:59Z`),
      dailyStartTime: null,
      dailyEndTime: null,
      applicableDate: null,
      isActive: isCurrentYear,
      approvalStatus: ApprovalStatus.APPROVED,
    });

    // 4. Weekend Tea & Biscuit Combo Discount (All years, active on weekends)
    // Buy tea + sweet biscuits combo price
    const teaBiscuitComboId = `disc-combo-teabiscuits-${year}`;
    discounts.push({
      id: teaBiscuitComboId,
      name: `Tea & Biscuits Weekend Combo ${year}`,
      type: DiscountType.COMBO,
      discountValue: 0, // value is determined by combo price
      comboPrice: 450,  // set combo price
      minBillAmount: null,
      label: 'TEABISCUITS',
      startDate: new Date(`${year}-01-01T00:00:00Z`),
      endDate: new Date(`${year}-12-31T23:59:59Z`),
      dailyStartTime: null,
      dailyEndTime: null,
      applicableDate: null,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
    });

    // 5. Weekend Beverage Combo (Soft drink + Snacks)
    const drinkSnackComboId = `disc-combo-drinksnack-${year}`;
    discounts.push({
      id: drinkSnackComboId,
      name: `Beverage & Chips Movie Combo ${year}`,
      type: DiscountType.COMBO,
      discountValue: 0,
      comboPrice: 380,
      minBillAmount: null,
      label: 'MOVIENIGHT',
      startDate: new Date(`${year}-01-01T00:00:00Z`),
      endDate: new Date(`${year}-12-31T23:59:59Z`),
      dailyStartTime: null,
      dailyEndTime: null,
      applicableDate: null,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
    });

    // 6. Minimum Bill Discount (Spend > 5000 get 500 off)
    const billThresholdDiscId = `disc-bill-5000-${year}`;
    discounts.push({
      id: billThresholdDiscId,
      name: `Mega Shopping Reward ${year}`,
      type: DiscountType.BILL,
      discountValue: 500, // 500 LKR off
      comboPrice: null,
      minBillAmount: 5000,
      label: 'MEGASAVER',
      startDate: new Date(`${year}-01-01T00:00:00Z`),
      endDate: new Date(`${year}-12-31T23:59:59Z`),
      dailyStartTime: null,
      dailyEndTime: null,
      applicableDate: null,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
    });
  });

  // 7. A couple of DRAFT/INACTIVE discounts to test validation (should not affect sales)
  discounts.push({
    id: 'disc-draft-test',
    name: 'Upcoming Summer Promo',
    type: DiscountType.SEASONAL,
    discountValue: 15,
    comboPrice: null,
    minBillAmount: null,
    label: 'DRAFT15',
    startDate: new Date('2024-06-01T00:00:00Z'),
    endDate: new Date('2024-06-30T23:59:59Z'),
    dailyStartTime: null,
    dailyEndTime: null,
    applicableDate: null,
    isActive: true,
    approvalStatus: ApprovalStatus.DRAFT,
  });

  // Map products to seasonal discounts
  products.forEach((prod) => {
    // School items
    if (prod.seasonal === 'SCHOOL_JAN') {
      years.forEach((yr) => {
        discountProducts.push({
          id: `dp-${++dpCount}`,
          discountId: `disc-school-${yr}`,
          sku: prod.sku,
        });
      });
    }

    // Baking ingredients
    if (prod.seasonal === 'FESTIVAL_DEC') {
      years.forEach((yr) => {
        discountProducts.push({
          id: `dp-${++dpCount}`,
          discountId: `disc-cake-${yr}`,
          sku: prod.sku,
        });
      });
    }

    // General discount-sensitive products get added to Avurudu Sale
    if (prod.demandProfile === 'DISCOUNT_SENSITIVE') {
      years.forEach((yr) => {
        discountProducts.push({
          id: `dp-${++dpCount}`,
          discountId: `disc-avurudu-${yr}`,
          sku: prod.sku,
        });
      });
    }
  });

  // Map products to Combo items
  // Find tea and biscuit products
  const teaProducts = products.filter((p) => p.sku.includes('WATA') || p.sku.includes('DILM'));
  const biscuitProducts = products.filter((p) => p.sku.includes('MUNC') || p.sku.includes('MALI'));
  const softDrinkProducts = products.filter((p) => p.sku.includes('COCA') || p.sku.includes('SPRI') || p.sku.includes('CREA'));
  const snackProducts = products.filter((p) => p.sku.includes('SMAK') || p.sku.includes('LANK'));

  years.forEach((yr) => {
    const teaDiscId = `disc-combo-teabiscuits-${yr}`;
    if (teaProducts.length > 0 && biscuitProducts.length > 0) {
      discountComboItems.push({
        id: `dci-${++dciCount}`,
        discountId: teaDiscId,
        sku: teaProducts[0].sku,
        minQty: 1,
      });
      discountComboItems.push({
        id: `dci-${++dciCount}`,
        discountId: teaDiscId,
        sku: biscuitProducts[0].sku,
        minQty: 1,
      });
    }

    const drinkDiscId = `disc-combo-drinksnack-${yr}`;
    if (softDrinkProducts.length > 0 && snackProducts.length > 0) {
      discountComboItems.push({
        id: `dci-${++dciCount}`,
        discountId: drinkDiscId,
        sku: softDrinkProducts[0].sku,
        minQty: 1,
      });
      discountComboItems.push({
        id: `dci-${++dciCount}`,
        discountId: drinkDiscId,
        sku: snackProducts[0].sku,
        minQty: 1,
      });
    }
  });

  return {
    discounts,
    discountProducts,
    discountComboItems,
  };
}
