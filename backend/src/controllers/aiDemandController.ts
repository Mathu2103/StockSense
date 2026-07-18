import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/api/ai-demand';

export async function generateForecast(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { targetMonth, force } = req.body;
    if (!targetMonth) {
      res.status(400).json({ success: false, message: 'targetMonth is required.' });
      return;
    }

    const response = await fetch(`${AI_SERVICE_URL}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetMonth, force }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ success: false, message: data.detail || 'Failed to generate forecast.' });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ success: false, message: 'AI service is currently unavailable.' });
  }
}

export async function getLatestForecastRun(req: AuthRequest, res: Response): Promise<void> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/forecast/latest`);
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ success: false, message: 'Failed to fetch latest forecast run.' });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching latest run:', error);
    res.status(500).json({ success: false, message: 'AI service is currently unavailable.' });
  }
}

export async function getForecastRunByMonth(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { month } = req.params;
    const response = await fetch(`${AI_SERVICE_URL}/forecast/month/${month}`);
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ success: false, message: `Failed to fetch forecast run for ${month}.` });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching run by month:', error);
    res.status(500).json({ success: false, message: 'AI service is currently unavailable.' });
  }
}

export async function getForecastRunDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { runId } = req.params;
    const { search, status, category, sortBy, sortOrder, page, limit } = req.query;

    // Build query params
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', String(search));
    if (status) queryParams.append('status', String(status));
    if (category) queryParams.append('category', String(category));
    if (sortBy) queryParams.append('sortBy', String(sortBy));
    if (sortOrder) queryParams.append('sortOrder', String(sortOrder));
    if (page) queryParams.append('page', String(page));
    if (limit) queryParams.append('limit', String(limit));

    const response = await fetch(`${AI_SERVICE_URL}/forecast/${runId}?${queryParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ success: false, message: data.detail || 'Failed to fetch forecast details.' });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching run details:', error);
    res.status(500).json({ success: false, message: 'AI service is currently unavailable.' });
  }
}

export async function getProductForecastDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { runId, sku } = req.params;
    const response = await fetch(`${AI_SERVICE_URL}/forecast/${runId}/product/${sku}`);
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ success: false, message: data.detail || 'Failed to fetch product forecast details.' });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching product forecast detail:', error);
    res.status(500).json({ success: false, message: 'AI service is currently unavailable.' });
  }
}
