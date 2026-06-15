import { prisma } from './src/config/prisma.js';

const categoryImages: Record<string, string> = {
  'Grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
  'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
  'Frozen Foods': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
  'Beverages': 'https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=600&auto=format&fit=crop',
  'Household': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=600&auto=format&fit=crop',
  'Personal Care': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop',
  'Snacks & Sweets': 'https://images.unsplash.com/photo-1582228116348-73595b225547?q=80&w=600&auto=format&fit=crop',
  'Meat & Seafood': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=600&auto=format&fit=crop',
  'Fresh Produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop'
};

const brandImages = [
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563694983011-6f4d90358083?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607006342411-b01354cc792a?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=200&auto=format&fit=crop'
];

async function updateDbImages() {
  console.log('Updating Categories...');
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const img = categoryImages[cat.name] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop';
    await prisma.category.update({
      where: { id: cat.id },
      data: { categoryImageUrl: img }
    });
  }



  console.log('Updating Products...');
  const products = await prisma.product.findMany({ include: { masterClass: { include: { category: true } } } });
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const catName = p.masterClass?.category?.name || 'Grocery';
    const baseImg = categoryImages[catName] || categoryImages['Grocery'];
    const img = `${baseImg}&sig=${i}`;
    await prisma.product.update({
      where: { sku: p.sku },
      data: { imageUrl: img }
    });
  }

  console.log('Done!');
}

updateDbImages().finally(() => prisma.$disconnect());
