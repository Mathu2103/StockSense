export enum DemandProfileType {
  STABLE_ESSENTIAL = 'STABLE_ESSENTIAL',
  FAST_GROWING = 'FAST_GROWING',
  SLOW_DECLINING = 'SLOW_DECLINING',
  HIGHLY_SEASONAL = 'HIGHLY_SEASONAL',
  WEEKEND_SENSITIVE = 'WEEKEND_SENSITIVE',
  DISCOUNT_SENSITIVE = 'DISCOUNT_SENSITIVE',
  COMBO_SENSITIVE = 'COMBO_SENSITIVE',
  INTERMITTENT = 'INTERMITTENT',
  LOW_VOLUME = 'LOW_VOLUME',
  NEW_PRODUCT = 'NEW_PRODUCT',
  BULK_PURCHASE_SENSITIVE = 'BULK_PURCHASE_SENSITIVE',
  EXPIRY_SENSITIVE = 'EXPIRY_SENSITIVE',
}

export interface DemandProfile {
  type: DemandProfileType;
  baseDemand: number;        // Base daily quantity demanded
  growthDeclineRate: number; // Yearly growth/decline rate (e.g., 0.05 for +5% per year)
  weekendMultiplier: number; // Multiplier applied on Sat/Sun
  monthMultipliers: { [month: number]: number }; // Month-specific multipliers (1-12)
  discountSensitivity: number; // Uplift multiplier during discount (e.g. 1.5 = +50%)
  comboSensitivity: number;    // Uplift multiplier during combo discount
  randomNoise: number;        // Standard deviation/multiplier for noise (e.g. 0.2 means +/-20% random fluctuation)
  reorderPointDays: number;   // Days of safety stock for reorder level
  leadTimeDays: number;       // Days between GRN triggers and arrival (simulated instantly but affects calculations)
  shelfLifeDays?: number;     // If specified, products will expire after these many days
  bulkProbability?: number;   // Probability of a bulk purchase
  bulkMultiplier?: number;    // Multiplier for bulk quantities
}

export const DEMAND_PROFILES: Record<DemandProfileType, DemandProfile> = {
  [DemandProfileType.STABLE_ESSENTIAL]: {
    type: DemandProfileType.STABLE_ESSENTIAL,
    baseDemand: 12.0,
    growthDeclineRate: 0.02,
    weekendMultiplier: 1.1,
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.15, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.05, 12: 1.2 },
    discountSensitivity: 1.1,
    comboSensitivity: 1.05,
    randomNoise: 0.1,
    reorderPointDays: 7,
    leadTimeDays: 2,
  },
  [DemandProfileType.FAST_GROWING]: {
    type: DemandProfileType.FAST_GROWING,
    baseDemand: 4.0,
    growthDeclineRate: 0.45, // 45% annual growth
    weekendMultiplier: 1.2,
    monthMultipliers: { 1: 0.9, 2: 0.9, 3: 0.95, 4: 1.1, 5: 1.0, 6: 1.0, 7: 1.05, 8: 1.05, 9: 1.1, 10: 1.1, 11: 1.2, 12: 1.4 },
    discountSensitivity: 1.4,
    comboSensitivity: 1.2,
    randomNoise: 0.2,
    reorderPointDays: 10,
    leadTimeDays: 3,
  },
  [DemandProfileType.SLOW_DECLINING]: {
    type: DemandProfileType.SLOW_DECLINING,
    baseDemand: 8.0,
    growthDeclineRate: -0.15, // -15% decline per year
    weekendMultiplier: 1.0,
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0, 12: 1.0 },
    discountSensitivity: 1.2,
    comboSensitivity: 1.1,
    randomNoise: 0.15,
    reorderPointDays: 5,
    leadTimeDays: 3,
  },
  [DemandProfileType.HIGHLY_SEASONAL]: {
    type: DemandProfileType.HIGHLY_SEASONAL,
    baseDemand: 5.0,
    growthDeclineRate: 0.05,
    weekendMultiplier: 1.15,
    // School items high in January (1); cake ingredients high in Nov (11), Dec (12); umbrellas in rainy seasons (May, Oct)
    monthMultipliers: { 1: 2.5, 2: 1.0, 3: 0.8, 4: 1.2, 5: 1.8, 6: 1.0, 7: 0.7, 8: 0.7, 9: 0.8, 10: 1.7, 11: 2.2, 12: 3.5 },
    discountSensitivity: 1.3,
    comboSensitivity: 1.15,
    randomNoise: 0.25,
    reorderPointDays: 14,
    leadTimeDays: 4,
  },
  [DemandProfileType.WEEKEND_SENSITIVE]: {
    type: DemandProfileType.WEEKEND_SENSITIVE,
    baseDemand: 10.0,
    growthDeclineRate: 0.05,
    weekendMultiplier: 2.8, // Massive sales spikes on weekends
    monthMultipliers: { 1: 0.9, 2: 0.9, 3: 1.0, 4: 1.3, 5: 1.0, 6: 1.0, 7: 1.1, 8: 1.1, 9: 1.0, 10: 1.0, 11: 1.1, 12: 1.5 },
    discountSensitivity: 1.5,
    comboSensitivity: 1.4,
    randomNoise: 0.15,
    reorderPointDays: 7,
    leadTimeDays: 2,
  },
  [DemandProfileType.DISCOUNT_SENSITIVE]: {
    type: DemandProfileType.DISCOUNT_SENSITIVE,
    baseDemand: 6.0,
    growthDeclineRate: 0.03,
    weekendMultiplier: 1.2,
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.1, 12: 1.3 },
    discountSensitivity: 2.5, // Extreme sales boost when discounted
    comboSensitivity: 1.2,
    randomNoise: 0.15,
    reorderPointDays: 8,
    leadTimeDays: 3,
  },
  [DemandProfileType.COMBO_SENSITIVE]: {
    type: DemandProfileType.COMBO_SENSITIVE,
    baseDemand: 5.0,
    growthDeclineRate: 0.04,
    weekendMultiplier: 1.3,
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.1, 12: 1.4 },
    discountSensitivity: 1.2,
    comboSensitivity: 2.2, // Extreme boost in combo deals
    randomNoise: 0.15,
    reorderPointDays: 8,
    leadTimeDays: 3,
  },
  [DemandProfileType.INTERMITTENT]: {
    type: DemandProfileType.INTERMITTENT,
    baseDemand: 0.5, // Low average demand
    growthDeclineRate: 0.01,
    weekendMultiplier: 1.3,
    monthMultipliers: { 1: 1.0, 2: 0.9, 3: 1.0, 4: 1.4, 5: 1.0, 6: 0.9, 7: 1.0, 8: 1.0, 9: 0.9, 10: 1.0, 11: 1.2, 12: 1.8 },
    discountSensitivity: 1.3,
    comboSensitivity: 1.1,
    randomNoise: 0.6, // High variance/noise
    reorderPointDays: 14,
    leadTimeDays: 5,
  },
  [DemandProfileType.LOW_VOLUME]: {
    type: DemandProfileType.LOW_VOLUME,
    baseDemand: 1.2,
    growthDeclineRate: -0.02,
    weekendMultiplier: 1.1,
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.1, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0, 12: 1.2 },
    discountSensitivity: 1.1,
    comboSensitivity: 1.05,
    randomNoise: 0.3,
    reorderPointDays: 10,
    leadTimeDays: 4,
  },
  [DemandProfileType.NEW_PRODUCT]: {
    type: DemandProfileType.NEW_PRODUCT,
    baseDemand: 6.0,
    growthDeclineRate: 0.20,
    weekendMultiplier: 1.25,
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0, 12: 1.1 },
    discountSensitivity: 1.3,
    comboSensitivity: 1.15,
    randomNoise: 0.2,
    reorderPointDays: 7,
    leadTimeDays: 2,
  },
  [DemandProfileType.BULK_PURCHASE_SENSITIVE]: {
    type: DemandProfileType.BULK_PURCHASE_SENSITIVE,
    baseDemand: 3.0,
    growthDeclineRate: 0.05,
    weekendMultiplier: 0.8, // Wholesale products purchased more on weekdays
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.1, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.1, 12: 1.3 },
    discountSensitivity: 1.4,
    comboSensitivity: 1.1,
    randomNoise: 0.25,
    reorderPointDays: 12,
    leadTimeDays: 3,
    bulkProbability: 0.08,
    bulkMultiplier: 8,
  },
  [DemandProfileType.EXPIRY_SENSITIVE]: {
    type: DemandProfileType.EXPIRY_SENSITIVE,
    baseDemand: 7.0,
    growthDeclineRate: 0.02,
    weekendMultiplier: 1.15,
    monthMultipliers: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.1, 12: 1.3 },
    discountSensitivity: 1.6, // Discount is very effective to clear stock before expiry
    comboSensitivity: 1.2,
    randomNoise: 0.12,
    reorderPointDays: 6,
    leadTimeDays: 2,
    shelfLifeDays: 45, // Expiring items (e.g. Milk packet, fresh bread, yogurt)
  },
};
