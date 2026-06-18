import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const createReportLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, format, status = 'Ready' } = req.body;
    if (!name || !category || !format) {
      res.status(400).json({ success: false, message: 'Name, category, and format are required.' });
      return;
    }

    const report = await prisma.generatedReport.create({
      data: {
        name,
        category,
        format,
        status,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error: any) {
    console.error('Error creating report log:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

export const getReportHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reports = await prisma.generatedReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ success: true, data: reports });
  } catch (error: any) {
    console.error('Error fetching report history:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

export const clearReportHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.generatedReport.deleteMany({});
    res.status(200).json({ success: true, message: 'Report history cleared successfully.' });
  } catch (error: any) {
    console.error('Error clearing report history:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};
