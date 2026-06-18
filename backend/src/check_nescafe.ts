import { prisma } from './config/prisma.js';

async function main() {
  const barcode = '4791000000744';
  
  // Find product
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { barcode },
        { sku: barcode },
        { name: { contains: 'Nescafe' } }
      ]
    },
    include: {
      discountProducts: {
        include: {
          discount: true
        }
      }
    }
  });

  console.log('--- PRODUCT INFO ---');
  if (!product) {
    console.log('Product not found in database!');
  } else {
    console.log(JSON.stringify(product, null, 2));
  }

  // Find all active approved discounts
  const activeDiscounts = await prisma.discount.findMany({
    where: {
      isActive: true,
      approvalStatus: 'APPROVED'
    },
    include: {
      discountProducts: true
    }
  });

  console.log('\n--- ACTIVE APPROVED DISCOUNTS ---');
  console.log(JSON.stringify(activeDiscounts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
