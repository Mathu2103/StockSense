import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const getSuppliers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, companyName, email, phone, address } = req.body;
    if (!name || !companyName) {
      res.status(400).json({ success: false, message: 'Name and Company Name are required' });
      return;
    }

    const newSupplier = await prisma.supplier.create({
      data: { name, companyName, email, phone, address }
    });

    res.status(201).json({ success: true, data: newSupplier });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, companyName, email, phone, address } = req.body;

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        companyName: companyName !== undefined ? companyName : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined
      }
    });

    res.status(200).json({ success: true, data: updatedSupplier });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }

    // Check if supplier is referenced in master product classes
    const classCount = await prisma.masterProductClass.count({
      where: { supplierId: id }
    });
    if (classCount > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete supplier because it is associated with products.'
      });
      return;
    }

    await prisma.supplier.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
