import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AdjustmentReason } from '@prisma/client';

// Helper reason mappers
const mapFrontendReasonToDb = (reason: string): AdjustmentReason => {
  switch (reason) {
    case 'Damaged': return AdjustmentReason.DAMAGED;
    case 'Lost': return AdjustmentReason.LOST;
    case 'Expired': return AdjustmentReason.EXPIRED;
    case 'Returned': return AdjustmentReason.RETURNED;
    case 'Counting error': return AdjustmentReason.COUNTING_ERROR;
    case 'System correction': return AdjustmentReason.SYSTEM_CORRECTION;
    default: return AdjustmentReason.SYSTEM_CORRECTION;
  }
};

const mapDbReasonToFrontend = (reason: AdjustmentReason): string => {
  switch (reason) {
    case AdjustmentReason.DAMAGED: return 'Damaged';
    case AdjustmentReason.LOST: return 'Lost';
    case AdjustmentReason.EXPIRED: return 'Expired';
    case AdjustmentReason.RETURNED: return 'Returned';
    case AdjustmentReason.COUNTING_ERROR: return 'Counting error';
    case AdjustmentReason.SYSTEM_CORRECTION: return 'System correction';
    default: return 'System correction';
  }
};

// Get all GRNs
export const getGRNs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const grns = await prisma.goodsReceivingNote.findMany({
      include: {
        supplier: true,
        operator: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { grnDate: 'desc' }
    });

    const mapped = grns.map((g) => {
      let totalQty = 0;
      let totalCost = 0;
      const items = g.items.map((item) => {
        totalQty += item.addedQuantity;
        totalCost += item.addedQuantity * item.unitCost;
        return {
          productName: item.product.name,
          sku: item.sku,
          orderedQty: item.addedQuantity,
          receivedQty: item.addedQuantity,
          unitCost: item.unitCost,
          mfgDate: item.mfd ? item.mfd.toISOString().split('T')[0] : '',
          expiryDate: item.epd ? item.epd.toISOString().split('T')[0] : ''
        };
      });

      return {
        id: g.id,
        grnNumber: g.grnId,
        supplierName: g.supplier.name,
        receivedDate: g.grnDate.toISOString().split('T')[0],
        items,
        totalQuantity: totalQty,
        totalCost,
        status: 'Completed',
        accuracyScore: 100,
        notes: g.notes || ''
      };
    });

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error fetching GRNs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create a new GRN
export const createGRN = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierName, notes, items } = req.body;

    if (!supplierName || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Supplier name and items are required' });
      return;
    }

    // Find supplier
    let supplier = await prisma.supplier.findFirst({
      where: { name: { equals: supplierName, mode: 'insensitive' } }
    });
    if (!supplier) {
      supplier = await prisma.supplier.findFirst();
      if (!supplier) {
        res.status(400).json({ success: false, message: 'No suppliers registered in database' });
        return;
      }
    }

    // Find operator
    const defaultUser = await prisma.user.findFirst({
      where: { role: 'INVENTORY_MANAGER' }
    }) || await prisma.user.findFirst();
    if (!defaultUser) {
      res.status(400).json({ success: false, message: 'No users registered in database' });
      return;
    }

    const grnId = `GRN-${Date.now().toString().slice(-8)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create GoodsReceivingNote
      const grn = await tx.goodsReceivingNote.create({
        data: {
          grnId,
          supplierId: supplier!.id,
          operatorId: defaultUser.id,
          notes: notes || null
        }
      });

      // 2. Loop through items
      const createdItems = [];
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { sku: item.sku }
        });
        if (!product) {
          throw new Error(`Product not found for SKU: ${item.sku}`);
        }

        const newStock = product.currentStock + Number(item.receivedQty || 0);

        // Update product stock and dates
        await tx.product.update({
          where: { sku: item.sku },
          data: {
            currentStock: newStock,
            mfgDate: item.mfgDate ? new Date(item.mfgDate) : product.mfgDate,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : product.expiryDate
          }
        });

        // Create GrnItem
        const grnItem = await tx.grnItem.create({
          data: {
            grnId: grn.id,
            sku: item.sku,
            addedQuantity: Number(item.receivedQty || 0),
            finalQuantity: newStock,
            unitCost: Number(item.unitCost || product.costPrice),
            mfd: item.mfgDate ? new Date(item.mfgDate) : null,
            epd: item.expiryDate ? new Date(item.expiryDate) : null
          },
          include: {
            product: true
          }
        });

        createdItems.push(grnItem);
      }

      return { grn, items: createdItems };
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.grn.id,
        grnNumber: result.grn.grnId,
        supplierName: supplier.name,
        receivedDate: result.grn.grnDate.toISOString().split('T')[0],
        items: result.items.map(i => ({
          productName: i.product.name,
          sku: i.sku,
          orderedQty: i.addedQuantity,
          receivedQty: i.addedQuantity,
          unitCost: i.unitCost,
          mfgDate: i.mfd ? i.mfd.toISOString().split('T')[0] : '',
          expiryDate: i.epd ? i.epd.toISOString().split('T')[0] : ''
        })),
        totalQuantity: result.items.reduce((sum, i) => sum + i.addedQuantity, 0),
        totalCost: result.items.reduce((sum, i) => sum + i.addedQuantity * i.unitCost, 0),
        status: 'Completed',
        accuracyScore: 100,
        notes: result.grn.notes || ''
      }
    });

  } catch (error: any) {
    console.error('Error creating GRN:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Get all Adjustments
export const getAdjustments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const adjs = await prisma.stockAdjustment.findMany({
      include: {
        product: true,
        adjustedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = adjs.map((a) => {
      return {
        id: a.id,
        adjustmentNumber: `ADJ-${a.id.substring(0, 8).toUpperCase()}`,
        productName: a.product.name,
        sku: a.sku,
        qtyChanged: a.qtyChanged,
        reason: mapDbReasonToFrontend(a.reason),
        adjustedBy: a.adjustedBy.name,
        date: a.createdAt.toISOString().split('T')[0],
        status: 'Approved',
        totalValue: Math.abs(a.qtyChanged * a.product.sellingPrice),
        beforeStock: a.finalQuantity - a.qtyChanged,
        afterStock: a.finalQuantity
      };
    });

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create a new Adjustment
export const createAdjustment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sku, qtyChanged, reason } = req.body;

    if (!sku || qtyChanged === undefined || !reason) {
      res.status(400).json({ success: false, message: 'SKU, Quantity Changed, and Reason are required' });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { sku }
    });

    if (!product) {
      res.status(404).json({ success: false, message: `Product not found for SKU: ${sku}` });
      return;
    }

    // Find operator
    const defaultUser = await prisma.user.findFirst({
      where: { role: 'INVENTORY_MANAGER' }
    }) || await prisma.user.findFirst();
    if (!defaultUser) {
      res.status(400).json({ success: false, message: 'No users registered in database' });
      return;
    }

    const finalQuantity = Math.max(0, product.currentStock + Number(qtyChanged));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create StockAdjustment
      const adj = await tx.stockAdjustment.create({
        data: {
          sku,
          qtyChanged: Number(qtyChanged),
          reason: mapFrontendReasonToDb(reason),
          adjustedById: defaultUser.id,
          finalQuantity
        },
        include: {
          product: true,
          adjustedBy: true
        }
      });

      // 2. Update Product current stock
      await tx.product.update({
        where: { sku },
        data: {
          currentStock: finalQuantity
        }
      });

      return adj;
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        adjustmentNumber: `ADJ-${result.id.substring(0, 8).toUpperCase()}`,
        productName: result.product.name,
        sku: result.sku,
        qtyChanged: result.qtyChanged,
        reason: mapDbReasonToFrontend(result.reason),
        adjustedBy: result.adjustedBy.name,
        date: result.createdAt.toISOString().split('T')[0],
        status: 'Approved',
        totalValue: Math.abs(result.qtyChanged * result.product.sellingPrice),
        beforeStock: finalQuantity - result.qtyChanged,
        afterStock: finalQuantity
      }
    });

  } catch (error) {
    console.error('Error creating adjustment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get unified Ledger entries
export const getLedger = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [grnItems, adjustments, billItems] = await Promise.all([
      prisma.grnItem.findMany({
        include: {
          product: true,
          grn: {
            include: {
              supplier: true,
              operator: true
            }
          }
        }
      }),
      prisma.stockAdjustment.findMany({
        include: {
          product: true,
          adjustedBy: true
        }
      }),
      prisma.billItem.findMany({
        include: {
          product: true,
          bill: {
            include: {
              cashier: true
            }
          }
        }
      })
    ]);

    const ledgerEntries: any[] = [];

    // Map GRNs
    grnItems.forEach((item) => {
      ledgerEntries.push({
        id: `grn-item-${item.id}`,
        timestamp: item.grn.grnDate.toISOString(),
        productName: item.product.name,
        sku: item.sku,
        movementType: 'GRN',
        quantityChange: item.addedQuantity,
        beforeStock: item.finalQuantity - item.addedQuantity,
        afterStock: item.finalQuantity,
        reason: `Goods Received (GRN: ${item.grn.grnId}) from ${item.grn.supplier.name}`,
        user: item.grn.operator.name,
        status: 'Success'
      });
    });

    // Map Adjustments
    adjustments.forEach((adj) => {
      const isExpiry = adj.reason === AdjustmentReason.EXPIRED;
      ledgerEntries.push({
        id: `adj-item-${adj.id}`,
        timestamp: adj.createdAt.toISOString(),
        productName: adj.product.name,
        sku: adj.sku,
        movementType: isExpiry ? 'Expiry Removal' : 'Adjustment',
        quantityChange: adj.qtyChanged,
        beforeStock: adj.finalQuantity - adj.qtyChanged,
        afterStock: adj.finalQuantity,
        reason: `Manual Correction: ${mapDbReasonToFrontend(adj.reason)}`,
        user: adj.adjustedBy.name,
        status: isExpiry || adj.reason === AdjustmentReason.DAMAGED ? 'Critical' : 'Success'
      });
    });

    // Map POS Sales
    billItems.forEach((bi) => {
      ledgerEntries.push({
        id: `bill-item-${bi.id}`,
        timestamp: bi.bill.createdAt.toISOString(),
        productName: bi.product.name,
        sku: bi.sku,
        movementType: 'Sale',
        quantityChange: -bi.qty,
        beforeStock: 0,
        afterStock: 0,
        reason: `POS Sale Checkout (Bill: ${bi.bill.billNumber})`,
        user: bi.bill.cashier.name,
        status: 'Success'
      });
    });

    // Sort by timestamp desc
    ledgerEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json({ success: true, data: ledgerEntries });
  } catch (error) {
    console.error('Error generating ledger:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
