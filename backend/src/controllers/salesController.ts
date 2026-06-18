import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { PaymentMethod } from '@prisma/client';

// Create a new bill (either completed or draft)
export const createBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cashierId = req.user?.id;
    if (!cashierId) {
      res.status(401).json({ success: false, message: 'Unauthorized. Cashier session not found.' });
      return;
    }

    const {
      subtotal,
      totalDiscount,
      totalBill,
      paymentMethod,
      totalQty,
      draft = false,
      items,
      resumeDraftId
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Bill must contain at least one item.' });
      return;
    }

    const prefix = draft ? 'DFT' : 'SB';
    
    // Find the latest bill with this prefix to determine the next sequential number
    const latestBill = await prisma.bill.findFirst({
      where: {
        billNumber: {
          startsWith: `${prefix}-`,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let nextNum = 1001;
    if (latestBill) {
      const parts = latestBill.billNumber.split('-');
      const lastPart = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastPart)) {
        nextNum = lastPart + 1;
      }
    }
    const billNumber = `${prefix}-${nextNum}`;

    // Execute in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Bill
      const bill = await tx.bill.create({
        data: {
          billNumber,
          cashierId,
          subtotal: parseFloat(subtotal),
          totalDiscount: parseFloat(totalDiscount || 0),
          totalBill: parseFloat(totalBill),
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          totalQty: parseInt(totalQty),
          draft,
          billItems: {
            create: items.map((item: any) => ({
              sku: item.sku,
              qty: parseInt(item.qty),
              unitPrice: parseFloat(item.unitPrice),
              total: parseFloat(item.total),
              discountId: item.discountId || null,
              discountValue: item.discountValue ? parseFloat(item.discountValue) : 0
            }))
          }
        },
        include: {
          billItems: {
            include: {
              product: true
            }
          }
        }
      });

      // 2. If it's a completed transaction (not draft):
      //    - Decrement product stock levels
      if (!draft) {
        for (const item of items) {
          // Verify product exists and get current stock
          const product = await tx.product.findUnique({
            where: { sku: item.sku }
          });

          if (product) {
            await tx.product.update({
              where: { sku: item.sku },
              data: {
                currentStock: {
                  decrement: parseInt(item.qty)
                }
              }
            });
          }
        }

        // 3. Delete original draft if we are resuming/completing an on-hold bill
        if (resumeDraftId) {
          // Verify it exists and is a draft
          const existingDraft = await tx.bill.findFirst({
            where: { id: resumeDraftId, draft: true }
          });

          if (existingDraft) {
            // Cascade delete bill items first
            await tx.billItem.deleteMany({
              where: { billId: resumeDraftId }
            });
            // Delete the bill itself
            await tx.bill.delete({
              where: { id: resumeDraftId }
            });
          }
        }
      }

      return bill;
    });

    res.status(201).json({
      success: true,
      message: draft ? 'Bill put on hold (Draft saved).' : 'Transaction completed successfully.',
      data: result
    });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

// Get completed sales history for the current cashier
export const getSalesHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cashierId = req.user?.id;
    if (!cashierId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const bills = await prisma.bill.findMany({
      where: {
        cashierId,
        draft: false
      },
      include: {
        billItems: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                imageUrl: true,
                sellingPrice: true
              }
            },
            discount: true
          }
        },
        cashier: {
          select: {
            name: true,
            email: true
          }
        },
        refunds: {
          include: {
            refundItems: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: bills
    });
  } catch (error: any) {
    console.error('Error fetching sales history:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

// Get all active draft (on-hold) bills
export const getDraftBills = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drafts = await prisma.bill.findMany({
      where: {
        draft: true
      },
      include: {
        billItems: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                imageUrl: true,
                sellingPrice: true,
                barcode: true
              }
            },
            discount: true
          }
        },
        cashier: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: drafts
    });
  } catch (error: any) {
    console.error('Error fetching draft bills:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

// Delete a draft bill
export const deleteDraftBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const draft = await prisma.bill.findFirst({
      where: {
        id,
        draft: true
      }
    });

    if (!draft) {
      res.status(404).json({ success: false, message: 'Draft bill not found.' });
      return;
    }

    await prisma.$transaction([
      prisma.billItem.deleteMany({
        where: { billId: id }
      }),
      prisma.bill.delete({
        where: { id }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Draft bill discarded successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting draft bill:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};
