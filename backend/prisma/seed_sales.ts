import { prisma } from '../src/config/prisma.js';
import { PaymentMethod, Role } from '@prisma/client';

async function main() {
  console.log('Seeding sales bills and draft bills...');

  // Find a cashier or admin to associate with the bills
  let user = await prisma.user.findFirst({
    where: { role: Role.CASHIER }
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    console.error('No users found in database! Please seed users first.');
    process.exit(1);
  }

  console.log(`Using user: ${user.name} (Role: ${user.role}, ID: ${user.id})`);

  // Find some products
  const products = await prisma.product.findMany({
    take: 5
  });

  if (products.length === 0) {
    console.error('No products found in database! Please seed products first.');
    process.exit(1);
  }

  console.log(`Found ${products.length} products to create bills.`);

  // Clear existing bills to start fresh (optional, but good for demo)
  console.log('Cleaning existing sales bills...');
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();

  // Create Completed Bill 1
  const p1 = products[0];
  const p2 = products[1] || products[0];
  
  const qty1 = 2;
  const qty2 = 1;
  const total1 = p1.sellingPrice * qty1;
  const total2 = p2.sellingPrice * qty2;
  const subtotal1 = total1 + total2;
  const totalBill1 = subtotal1;

  await prisma.bill.create({
    data: {
      billNumber: 'SB-1001',
      cashierId: user.id,
      subtotal: subtotal1,
      totalDiscount: 0,
      totalBill: totalBill1,
      paymentMethod: PaymentMethod.CASH,
      totalQty: qty1 + qty2,
      draft: false,
      createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      billItems: {
        create: [
          {
            sku: p1.sku,
            qty: qty1,
            unitPrice: p1.sellingPrice,
            total: total1,
            discountValue: 0
          },
          {
            sku: p2.sku,
            qty: qty2,
            unitPrice: p2.sellingPrice,
            total: total2,
            discountValue: 0
          }
        ]
      }
    }
  });

  // Create Completed Bill 2 (with discount)
  const p3 = products[2] || products[0];
  const qty3 = 3;
  const originalTotal3 = p3.sellingPrice * qty3;
  const discountVal3 = 10; // 10%
  const finalTotal3 = originalTotal3 * 0.9;
  const subtotal2 = originalTotal3;
  const totalDiscount2 = originalTotal3 * 0.1;
  const totalBill2 = finalTotal3;

  await prisma.bill.create({
    data: {
      billNumber: 'SB-1002',
      cashierId: user.id,
      subtotal: subtotal2,
      totalDiscount: totalDiscount2,
      totalBill: totalBill2,
      paymentMethod: PaymentMethod.CARD,
      totalQty: qty3,
      draft: false,
      createdAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
      billItems: {
        create: [
          {
            sku: p3.sku,
            qty: qty3,
            unitPrice: p3.sellingPrice,
            total: finalTotal3,
            discountValue: discountVal3
          }
        ]
      }
    }
  });

  // Create a Draft Bill (On hold)
  const qtyDraft = 1;
  const totalDraft = p1.sellingPrice * qtyDraft;

  await prisma.bill.create({
    data: {
      billNumber: 'DFT-1003',
      cashierId: user.id,
      subtotal: totalDraft,
      totalDiscount: 0,
      totalBill: totalDraft,
      paymentMethod: PaymentMethod.CASH,
      totalQty: qtyDraft,
      draft: true,
      createdAt: new Date(),
      billItems: {
        create: [
          {
            sku: p1.sku,
            qty: qtyDraft,
            unitPrice: p1.sellingPrice,
            total: totalDraft,
            discountValue: 0
          }
        ]
      }
    }
  });

  // Seed target testing APPROVED combo and bill threshold discounts
  console.log('Cleaning target testing discounts...');
  await prisma.discountComboItem.deleteMany({
    where: {
      discount: {
        name: { in: ['Breakfast Combo', 'Mega Saver Bill Offer'] }
      }
    }
  });
  await prisma.discountProduct.deleteMany({
    where: {
      discount: {
        name: { in: ['Breakfast Combo', 'Mega Saver Bill Offer'] }
      }
    }
  });
  await prisma.discount.deleteMany({
    where: {
      name: { in: ['Breakfast Combo', 'Mega Saver Bill Offer'] }
    }
  });

  console.log('Seeding APPROVED combo discount...');
  const comboDiscount = await prisma.discount.create({
    data: {
      name: 'Breakfast Combo',
      type: 'COMBO',
      discountValue: 15,
      label: 'COMBO SAVER',
      isActive: true,
      approvalStatus: 'APPROVED',
      comboItems: {
        create: [
          { sku: p1.sku, minQty: 1 },
          { sku: p2.sku, minQty: 1 }
        ]
      }
    }
  });
  console.log(`Seeded Breakfast Combo (ID: ${comboDiscount.id}) with SKUs ${p1.sku} and ${p2.sku}`);

  console.log('Seeding APPROVED threshold bill discount...');
  const billDiscount = await prisma.discount.create({
    data: {
      name: 'Mega Saver Bill Offer',
      type: 'BILL',
      discountValue: 5, // 5% discount
      minBillAmount: 500, // Rs. 500 minimum threshold
      label: 'BILL OFFER',
      isActive: true,
      approvalStatus: 'APPROVED'
    }
  });
  console.log(`Seeded Mega Saver Bill Offer (ID: ${billDiscount.id})`);

  console.log('Successfully seeded sales and draft bills!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
