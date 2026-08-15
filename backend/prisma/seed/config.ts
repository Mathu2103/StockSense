import 'dotenv/config';

export const SEED_MODE = (process.env.SEED_MODE || 'small').toLowerCase() as 'small' | 'full';

export const START_DATE = new Date('2023-01-01T00:00:00Z');
export const END_DATE = new Date('2025-12-31T23:59:59Z');

// Configurable constants based on SEED_MODE
export const PRODUCT_COUNT = SEED_MODE === 'full' ? 220 : 40;
export const INACTIVE_PRODUCT_COUNT = SEED_MODE === 'full' ? 15 : 0;
export const BILL_TARGET_COUNT = SEED_MODE === 'full' ? 120000 : 8000;

export const CATEGORY_COUNT = SEED_MODE === 'full' ? 12 : 5;
export const SUBCATEGORY_COUNT = SEED_MODE === 'full' ? 25 : 8;
export const BRAND_COUNT = SEED_MODE === 'full' ? 20 : 6;
export const SUPPLIER_COUNT = SEED_MODE === 'full' ? 15 : 4;

export const RANDOM_SEED = parseInt(process.env.RANDOM_SEED || '42', 10);
export const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '2000', 10);
