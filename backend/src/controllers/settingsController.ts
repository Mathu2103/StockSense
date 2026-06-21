import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const key = req.params.key as string;

    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    });

    if (!setting) {
      return res.status(404).json({ message: "Setting not found", data: null });
    }

    res.status(200).json({ message: "Setting retrieved successfully", data: setting.value });
  } catch (error) {
    console.error("Error retrieving setting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const key = req.params.key as string;
    const { value } = req.body;

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    res.status(200).json({ message: "Setting updated successfully", data: setting.value });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const applyStockRulesToAllProducts = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'STOCK_RULES' }
    });

    if (!setting || !setting.value) {
      return res.status(400).json({ message: "Global stock rules not found. Please save them first." });
    }

    const rules = setting.value as any;
    const defaultReorderLevelPct = parseFloat(rules.defaultReorderLevel) || 0;
    // const minimumStockThresholdPct = parseFloat(rules.minimumStockThreshold) || 0;

    const products = await prisma.product.findMany({
      select: { sku: true, targetCapacity: true }
    });

    const updates = products.map(product => {
      const calculatedReorderLevel = Math.round((product.targetCapacity * defaultReorderLevelPct) / 100);
      
      return prisma.product.update({
        where: { sku: product.sku },
        data: { 
          reorderLevel: calculatedReorderLevel,
          // If you ever add minimumStockLevel to the Product schema, you can update it here:
          // minimumStockLevel: Math.round((product.targetCapacity * minimumStockThresholdPct) / 100)
        }
      });
    });

    await prisma.$transaction(updates);

    res.status(200).json({ 
      message: `Successfully applied stock rules to ${products.length} products.`,
      updatedCount: products.length
    });

  } catch (error) {
    console.error("Error applying stock rules to products:", error);
    res.status(500).json({ message: "Internal server error while applying rules." });
  }
};
