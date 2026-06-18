import { prisma } from './config/prisma.js';

async function main() {
  console.log('Updating database discounts for live POS testing...');

  // 1. Set Nescafe Classic 50g product-level discount to 10%
  const updatedProduct = await prisma.product.update({
    where: { sku: 'NES-NESC-50G-0074' },
    data: { discount: 10 }
  });
  console.log(`Updated product ${updatedProduct.name} default discount to ${updatedProduct.discount}%`);

  // 2. Make New Year Mega Sale (d-1) campaign active today (June 18, 2026)
  const updatedSeasonal = await prisma.discount.update({
    where: { id: 'd-1' },
    data: {
      startDate: new Date('2026-06-01T00:00:00Z'),
      endDate: new Date('2026-06-30T00:00:00Z')
    }
  });
  console.log(`Updated Seasonal campaign "${updatedSeasonal.name}" validity: ${updatedSeasonal.startDate?.toISOString()} to ${updatedSeasonal.endDate?.toISOString()}`);

  // 3. Make Morning Bakery Deal (d-2) campaign active all day (00:00 to 23:59)
  const updatedDaily = await prisma.discount.update({
    where: { id: 'd-2' },
    data: {
      dailyStartTime: '00:00',
      dailyEndTime: '23:59'
    }
  });
  console.log(`Updated Daily campaign "${updatedDaily.name}" hours: ${updatedDaily.dailyStartTime} to ${updatedDaily.dailyEndTime}`);

  console.log('Database updates complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
