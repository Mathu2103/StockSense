import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { DiscountType, ApprovalStatus } from '@prisma/client';

// Get all discounts
export const getDiscounts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        discountProducts: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                sellingPrice: true,
                currentStock: true,
                imageUrl: true
              }
            }
          }
        },
        comboItems: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                sellingPrice: true,
                currentStock: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map to frontend-friendly structure
    const formattedDiscounts = discounts.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      discountValue: d.discountValue,
      comboPrice: d.comboPrice,
      minBillAmount: d.minBillAmount || undefined,
      label: d.label || undefined,
      imageUrl: d.imageUrl || undefined,
      startDate: d.startDate ? d.startDate.toISOString().split('T')[0] : undefined,
      endDate: d.endDate ? d.endDate.toISOString().split('T')[0] : undefined,
      dailyStartTime: d.dailyStartTime || undefined,
      dailyEndTime: d.dailyEndTime || undefined,
      applicableDate: d.applicableDate ? d.applicableDate.toISOString().split('T')[0] : undefined,
      isActive: d.isActive,
      approvalStatus: d.approvalStatus,
      createdAt: d.createdAt.toISOString(),
      productIds: d.discountProducts.map(p => p.sku),
      comboItems: d.comboItems.map(item => ({
        productId: item.sku,
        minQty: item.minQty
      }))
    }));

    res.status(200).json({ success: true, data: formattedDiscounts });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create a new discount
export const createDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      type,
      discountValue,
      comboPrice,
      label,
      imageUrl,
      startDate,
      endDate,
      dailyStartTime,
      dailyEndTime,
      applicableDate,
      minBillAmount,
      productIds, // array of skus
      comboItems,  // array of { productId, minQty }
    } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, message: 'Name and type are required' });
      return;
    }

    // Prepare data
    const data: any = {
      name,
      type: type as DiscountType,
      discountValue: parseFloat(discountValue) || 0,
      comboPrice: null,
      label: label || null,
      imageUrl: imageUrl || null,
      startDate: (type === 'SEASONAL' && startDate) ? new Date(startDate) : null,
      endDate: (type === 'SEASONAL' && endDate) ? new Date(endDate) : null,
      dailyStartTime: type === 'DAILY' ? dailyStartTime : null,
      dailyEndTime: type === 'DAILY' ? dailyEndTime : null,
      applicableDate: (type === 'DAILY' && applicableDate) ? new Date(applicableDate) : null,
      minBillAmount: (type === 'BILL' && minBillAmount) ? parseFloat(minBillAmount) : null,
      isActive: true,
      approvalStatus: ApprovalStatus.DRAFT,
    };

    // Create the discount campaign inside a Prisma transaction
    const newDiscount = await prisma.$transaction(async (tx) => {
      const discount = await tx.discount.create({ data });

      // Create target product mappings if seasonal or daily
      if (type !== 'COMBO' && Array.isArray(productIds)) {
        await tx.discountProduct.createMany({
          data: productIds.map((sku: string) => ({
            discountId: discount.id,
            sku
          }))
        });
      }

      // Create combo items if combo
      if (type === 'COMBO' && Array.isArray(comboItems)) {
        await tx.discountComboItem.createMany({
          data: comboItems.map((item: any) => ({
            discountId: discount.id,
            sku: item.productId, // maps to product SKU
            minQty: parseInt(item.minQty) || 1
          }))
        });
      }

      return discount;
    });

    res.status(201).json({ success: true, data: newDiscount });
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update an existing discount
export const updateDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const {
      name,
      type,
      discountValue,
      comboPrice,
      label,
      imageUrl,
      startDate,
      endDate,
      dailyStartTime,
      dailyEndTime,
      applicableDate,
      minBillAmount,
      productIds, // array of skus
      comboItems,  // array of { productId, minQty }
      isActive,
      approvalStatus
    } = req.body;

    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount) {
      res.status(404).json({ success: false, message: 'Discount not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedDiscount = await tx.discount.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          type: type !== undefined ? (type as DiscountType) : undefined,
          discountValue: discountValue !== undefined ? parseFloat(discountValue) || 0 : undefined,
          comboPrice: null,
          label: label !== undefined ? label || null : undefined,
          imageUrl: imageUrl !== undefined ? imageUrl || null : undefined,
          startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
          dailyStartTime: dailyStartTime !== undefined ? dailyStartTime || null : undefined,
          dailyEndTime: dailyEndTime !== undefined ? dailyEndTime || null : undefined,
          applicableDate: applicableDate !== undefined ? (applicableDate ? new Date(applicableDate) : null) : undefined,
          minBillAmount: minBillAmount !== undefined ? (minBillAmount ? parseFloat(minBillAmount) : null) : undefined,
          isActive: isActive !== undefined ? isActive : undefined,
          approvalStatus: ApprovalStatus.DRAFT // Auto reset to DRAFT when edited
        }
      });

      const finalType = type || discount.type;

      // Update product IDs for seasonal/daily
      if (productIds !== undefined && finalType !== 'COMBO') {
        // Clear old relations
        await tx.discountProduct.deleteMany({ where: { discountId: id } });
        // Add new relations
        if (Array.isArray(productIds)) {
          await tx.discountProduct.createMany({
            data: productIds.map((sku: string) => ({
              discountId: id,
              sku
            }))
          });
        }
      }

      // Update combo items
      if (comboItems !== undefined && finalType === 'COMBO') {
        // Clear old combo items
        await tx.discountComboItem.deleteMany({ where: { discountId: id } });
        // Add new combo items
        if (Array.isArray(comboItems)) {
          await tx.discountComboItem.createMany({
            data: comboItems.map((item: any) => ({
              discountId: id,
              sku: item.productId,
              minQty: parseInt(item.minQty) || 1
            }))
          });
        }
      }

      return updatedDiscount;
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Toggle Active/Approval status
export const toggleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isActive, approvalStatus } = req.body;

    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount) {
      res.status(404).json({ success: false, message: 'Discount not found' });
      return;
    }

    const updated = await prisma.discount.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        approvalStatus: approvalStatus !== undefined ? (approvalStatus as ApprovalStatus) : ApprovalStatus.DRAFT
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete a discount
export const deleteDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount) {
      res.status(404).json({ success: false, message: 'Discount not found' });
      return;
    }

    if (discount.approvalStatus === ApprovalStatus.APPROVED) {
      res.status(400).json({
        success: false,
        message: 'This discount campaign is already approved by the admin. You cannot delete it. Please contact the admin.'
      });
      return;
    }

    await prisma.discount.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
