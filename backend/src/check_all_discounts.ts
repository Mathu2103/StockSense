import { prisma } from './config/prisma.js';

async function main() {
  // Find products with default discount > 0
  const productsWithDefaultDiscount = await prisma.product.findMany({
    where: {
      discount: {
        gt: 0
      }
    },
    select: {
      sku: true,
      name: true,
      sellingPrice: true,
      discount: true
    }
  });

  console.log('--- PRODUCTS WITH DEFAULT DISCOUNT > 0 ---');
  console.log(JSON.stringify(productsWithDefaultDiscount, null, 2));

  // Find all campaign discounts
  const campaigns = await prisma.discount.findMany({
    include: {
      discountProducts: {
        include: {
          product: {
            select: {
              sku: true,
              name: true
            }
          }
        }
      }
    }
  });

  console.log('\n--- ALL DATABASE CAMPAIGNS ---');
  console.log(JSON.stringify(campaigns, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
