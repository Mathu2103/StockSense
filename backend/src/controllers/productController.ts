import { Request, Response } from 'express';
import { ProductStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const mapStatus = (statusStr?: string): ProductStatus => {
  if (!statusStr) return ProductStatus.ACTIVE;
  const lower = statusStr.toLowerCase();
  if (lower === 'active') return ProductStatus.ACTIVE;
  if (lower === 'inactive') return ProductStatus.INACTIVE;
  if (lower === 'disconnected') return ProductStatus.DISCONTINUED;
  return ProductStatus.ACTIVE;
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        masterClass: {
          include: {
            category: true,
            subCategory: true,
            brand: true,
            supplier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      productStructure, name, categoryId, subCategoryId, brandId, supplierId, imageUrl,
      barcode, unitType, costPrice, sellingPrice, currentStock, reorderLevel, targetCapacity,
      variants, status
    } = req.body;

    if (!name || !categoryId || !brandId || !supplierId) {
      res.status(400).json({ success: false, message: 'Missing required master fields' });
      return;
    }

    const hasVariants = productStructure === 'variant' && variants && variants.length > 0;

    // 1. Create Master Product Class
    const master = await prisma.masterProductClass.create({
      data: {
        name,
        categoryId,
        subCategoryId: subCategoryId || null,
        brandId,
        supplierId,
        hasVariant: hasVariants
      }
    });

    const createdProducts = [];

    // 2. Create products based on structure
    if (hasVariants) {
      // Loop and create variants
      for (const v of variants) {
        const p = await prisma.product.create({
          data: {
            sku: v.sku || `VAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            masterId: master.id,
            barcode: v.barcode || `479${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            name: v.variantName || name,
            unitType: v.unit || 'Piece',
            costPrice: Number(v.costPrice || 0),
            sellingPrice: Number(v.sellingPrice || 0),
            currentStock: Number(v.stock || 0),
            reorderLevel: Number(v.reorderLevel || 10),
            targetCapacity: Number(v.targetCapacity || 50),
            status: mapStatus(status),
            imageUrl: v.imageUrl || imageUrl || '',
            variantAttributeType: v.attributeType ? `${v.attributeType}: ${v.attributeValue}` : null,
            batchNumber: v.batchNumber || null,
            mfgDate: v.mfgDate ? new Date(v.mfgDate) : null,
            expiryDate: v.expiryDate ? new Date(v.expiryDate) : null
          }
        });
        createdProducts.push(p);
      }
    } else {
      // Single product
      const newSku = req.body.sku || `MANUAL-${Date.now()}`;
      const p = await prisma.product.create({
        data: {
          sku: newSku,
          masterId: master.id,
          barcode: barcode || `479${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          name: name, // Single product inherits master name
          unitType: unitType || 'Piece',
          costPrice: Number(costPrice || 0),
          sellingPrice: Number(sellingPrice || 0),
          currentStock: Number(currentStock || 0),
          reorderLevel: Number(reorderLevel || 10),
          targetCapacity: Number(targetCapacity || 50),
          status: mapStatus(status),
          imageUrl: imageUrl || '',
          mfgDate: req.body.mfgDate ? new Date(req.body.mfgDate) : null,
          expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
          batchNumber: req.body.batchNumber || null
        }
      });
      createdProducts.push(p);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Product(s) created successfully',
      data: { master, products: createdProducts }
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sku } = req.params;
    const { 
      productStructure, name, categoryId, subCategoryId, brandId, supplierId, imageUrl,
      barcode, unitType, costPrice, sellingPrice, currentStock, reorderLevel, targetCapacity,
      variants, mfgDate, expiryDate, batchNumber, status
    } = req.body;

    if (!sku || typeof sku !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid or missing SKU' });
      return;
    }

    // Find the product and its master class
    const product = await prisma.product.findUnique({
      where: { sku },
      include: { masterClass: true }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const masterId = product.masterId;
    const hasVariants = productStructure === 'variant' && variants && variants.length > 0;

    // 1. Update Master Product Class
    await prisma.masterProductClass.update({
      where: { id: masterId },
      data: {
        name,
        categoryId,
        subCategoryId: subCategoryId || null,
        brandId,
        supplierId,
        hasVariant: hasVariants
      }
    });

    const updatedProducts = [];

    if (hasVariants) {
      // It's a variant product. We need to upsert all variants and remove missing ones.
      const existingVariants = await prisma.product.findMany({
        where: { masterId }
      });

      const existingSkus = existingVariants.map((v) => v.sku);
      const incomingSkus = variants.map((v: any) => v.sku).filter(Boolean);

      // Identify variants to delete/deactivate
      const skusToDelete = existingSkus.filter((s) => !incomingSkus.includes(s));

      if (skusToDelete.length > 0) {
        try {
          await prisma.product.deleteMany({
            where: { sku: { in: skusToDelete } }
          });
        } catch (delError) {
          // If referenced in transactions, set their status to INACTIVE instead of throwing
          await prisma.product.updateMany({
            where: { sku: { in: skusToDelete } },
            data: { status: ProductStatus.INACTIVE }
          });
        }
      }

      // Upsert incoming variants
      for (const v of variants) {
        const variantSku = v.sku || `VAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const p = await prisma.product.upsert({
          where: { sku: variantSku },
          update: {
            barcode: v.barcode || `479${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            name: v.variantName || name,
            unitType: v.unit || 'Piece',
            costPrice: Number(v.costPrice || 0),
            sellingPrice: Number(v.sellingPrice || 0),
            currentStock: Number(v.stock || 0),
            reorderLevel: Number(v.reorderLevel || 10),
            targetCapacity: Number(v.targetCapacity || 50),
            imageUrl: v.imageUrl || imageUrl || '',
            variantAttributeType: v.attributeType ? `${v.attributeType}: ${v.attributeValue}` : null,
            batchNumber: v.batchNumber || null,
            mfgDate: v.mfgDate ? new Date(v.mfgDate) : null,
            expiryDate: v.expiryDate ? new Date(v.expiryDate) : null,
            status: mapStatus(status)
          },
          create: {
            sku: variantSku,
            masterId: masterId,
            barcode: v.barcode || `479${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            name: v.variantName || name,
            unitType: v.unit || 'Piece',
            costPrice: Number(v.costPrice || 0),
            sellingPrice: Number(v.sellingPrice || 0),
            currentStock: Number(v.stock || 0),
            reorderLevel: Number(v.reorderLevel || 10),
            targetCapacity: Number(v.targetCapacity || 50),
            status: mapStatus(status),
            imageUrl: v.imageUrl || imageUrl || '',
            variantAttributeType: v.attributeType ? `${v.attributeType}: ${v.attributeValue}` : null,
            batchNumber: v.batchNumber || null,
            mfgDate: v.mfgDate ? new Date(v.mfgDate) : null,
            expiryDate: v.expiryDate ? new Date(v.expiryDate) : null
          }
        });
        updatedProducts.push(p);
      }
    } else {
      // Single product.
      // Update the product itself.
      // Since it is single, if there were previously variants, delete them (or deactivate if unsafe)
      const existingVariants = await prisma.product.findMany({
        where: { masterId, sku: { not: sku } }
      });

      if (existingVariants.length > 0) {
        const otherSkus = existingVariants.map((v) => v.sku);
        try {
          await prisma.product.deleteMany({
            where: { sku: { in: otherSkus } }
          });
        } catch (delError) {
          await prisma.product.updateMany({
            where: { sku: { in: otherSkus } },
            data: { status: ProductStatus.INACTIVE }
          });
        }
      }

      const p = await prisma.product.update({
        where: { sku },
        data: {
          barcode: barcode || product.barcode,
          name: name,
          unitType: unitType || 'Piece',
          costPrice: Number(costPrice || 0),
          sellingPrice: Number(sellingPrice || 0),
          currentStock: Number(currentStock || 0),
          reorderLevel: Number(reorderLevel || 10),
          targetCapacity: Number(targetCapacity || 50),
          imageUrl: imageUrl || '',
          variantAttributeType: null, // Clear attributes for single product
          mfgDate: mfgDate ? new Date(mfgDate) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          batchNumber: batchNumber || null,
          status: mapStatus(status)
        }
      });
      updatedProducts.push(p);
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProducts
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
