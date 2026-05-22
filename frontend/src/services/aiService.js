import axios from 'axios'
import { PYTHON_API_URL } from '../config/env'

const aiApi = axios.create({ baseURL: PYTHON_API_URL, headers: { 'Content-Type': 'application/json' } })

export const aiService = {
  getAprioriRecommendations: (productIds) => aiApi.post('/apriori/recommend', { product_ids: productIds }),
  getGeminiOffers: () => aiApi.get('/gemini/offers'),
  getRestockPredictions: () => aiApi.get('/restock/predict'),
}

