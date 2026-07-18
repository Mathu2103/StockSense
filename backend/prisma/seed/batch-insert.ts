import { PrismaClient } from '@prisma/client';
import { BATCH_SIZE } from './config.js';

export async function batchInsert<T>(
  prisma: PrismaClient,
  modelName: keyof PrismaClient,
  data: T[],
  label: string
): Promise<number> {
  if (data.length === 0) {
    console.log(`[Batch Insert] No data to insert for ${label}`);
    return 0;
  }

  console.log(`[Batch Insert] Starting insertion of ${data.length} records for ${label}...`);
  const startTime = Date.now();

  let insertedCount = 0;
  const model: any = prisma[modelName];

  if (!model || typeof model.createMany !== 'function') {
    throw new Error(`Model ${String(modelName)} does not support createMany operations or does not exist on Prisma client.`);
  }

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    try {
      const result = await model.createMany({
        data: batch,
        skipDuplicates: true,
      });
      insertedCount += result.count;
      
      const pct = Math.min(100, Math.round(((i + batch.length) / data.length) * 100));
      console.log(`  -> [${label}] Progress: ${pct}% (${insertedCount}/${data.length} inserted)`);
    } catch (error) {
      console.error(`[Batch Insert ERROR] Failed to insert batch for ${label} at index ${i}:`, error);
      throw error;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Batch Insert] Completed ${label}: ${insertedCount} records inserted in ${duration}s.`);
  return insertedCount;
}
