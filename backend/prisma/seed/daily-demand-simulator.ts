import { SeededRandom } from './deterministic-random.js';
import { ProductCatalogItem } from './product-catalog.js';
import { DEMAND_PROFILES } from './product-demand-profiles.js';
import { DiscountInput } from './discount-generator.js';

export function calculateDailyDemand(
  date: Date,
  product: ProductCatalogItem,
  activeDiscounts: DiscountInput[],
  random: SeededRandom
): number {
  // 1. Check launch and discontinuation dates
  if (date < product.launchDate) {
    return 0;
  }
  if (product.discontinuationDate && date >= product.discontinuationDate) {
    return 0;
  }

  const profile = DEMAND_PROFILES[product.demandProfile];
  if (!profile) {
    return 0;
  }

  // 2. Base demand
  const baseDemand = profile.baseDemand;

  // 3. Long-term trend multiplier
  const msInYear = 365.25 * 24 * 60 * 60 * 1000;
  const startDate = new Date('2023-01-01T00:00:00Z');
  const yearsPassed = (date.getTime() - startDate.getTime()) / msInYear;
  const longTermTrendMultiplier = Math.pow(1 + profile.growthDeclineRate, yearsPassed);

  // 4. Day of week multiplier
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayOfWeekMultiplier = isWeekend ? profile.weekendMultiplier : 1.0;

  // 5. Month multiplier (1-12)
  const month = date.getUTCMonth() + 1; // 0-indexed to 1-indexed
  const monthMultiplier = profile.monthMultipliers[month] || 1.0;

  // 6. Discount & Combo Multipliers
  let discountMultiplier = 1.0;
  let comboMultiplier = 1.0;

  // Check if this product has any active approved discount on this date
  const matchedDiscounts = activeDiscounts.filter((d) => {
    if (d.approvalStatus !== 'APPROVED') return false;
    if (d.startDate && date < d.startDate) return false;
    if (d.endDate && date > d.endDate) return false;
    return true;
  });

  const hasSeasonalOrDaily = matchedDiscounts.some((d) => d.type === 'SEASONAL' || d.type === 'DAILY');
  const hasCombo = matchedDiscounts.some((d) => d.type === 'COMBO');

  if (hasSeasonalOrDaily) {
    discountMultiplier = profile.discountSensitivity;
  }
  if (hasCombo) {
    comboMultiplier = profile.comboSensitivity;
  }

  // 7. Deterministic Noise
  // E.g., if noise is 0.15, multiplier is between 0.85 and 1.15
  const noiseRange = profile.randomNoise;
  const deterministicNoise = random.nextFloat(1.0 - noiseRange, 1.0 + noiseRange);

  // Calculate latent demand
  const latentDemand =
    baseDemand *
    longTermTrendMultiplier *
    dayOfWeekMultiplier *
    monthMultiplier *
    discountMultiplier *
    comboMultiplier *
    deterministicNoise;

  // Ensure demand is non-negative
  return Math.max(0, latentDemand);
}
