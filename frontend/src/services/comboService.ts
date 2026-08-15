import { api } from './axiosInstance';

export const comboService = {
  async runComboAnalysis(cutoffDate?: string) {
    const response = await api.post('/combo-analysis/run', { cutoffDate });
    return response.data;
  },

  async getComboAnalysisStatus(runId: string) {
    const response = await api.get(`/combo-analysis/runs/${runId}`);
    return response.data;
  },

  async getOpportunities(params?: { type?: string; status?: string }) {
    const response = await api.get('/combo-opportunities', { params });
    return response.data;
  },

  async getOpportunityDetails(id: string) {
    const response = await api.get(`/combo-opportunities/${id}`);
    return response.data;
  },

  async ignoreOpportunity(id: string) {
    const response = await api.post(`/combo-opportunities/${id}/ignore`);
    return response.data;
  },

  async getSuggestions(status?: string) {
    const response = await api.get('/combo-suggestions', { params: { status } });
    return response.data;
  },

  async getSuggestionDetails(id: string) {
    const response = await api.get(`/combo-suggestions/${id}`);
    return response.data;
  },

  async generateSuggestions(oppId: string) {
    const response = await api.post(`/combo-suggestions/generate/${oppId}`);
    return response.data;
  },

  async convertToDraft(sugId: string) {
    const response = await api.post(`/combo-suggestions/${sugId}/convert-to-draft`);
    return response.data;
  },

  async createComboDraft(data: any) {
    const response = await api.post('/combos', data);
    return response.data;
  },

  async updateComboDraft(id: string, data: any) {
    const response = await api.patch(`/combos/${id}`, data);
    return response.data;
  },

  async getCombosList(status?: string) {
    const response = await api.get('/combos', { params: { status } });
    return response.data;
  },

  async getCombos(status?: string) {
    const response = await api.get('/combos', { params: { status } });
    return response.data;
  },

  async getComboDetails(id: string) {
    const response = await api.get(`/combos/${id}`);
    return response.data;
  },

  async submitComboForApproval(id: string) {
    const response = await api.post(`/combos/${id}/submit`);
    return response.data;
  },

  async approveCombo(id: string) {
    const response = await api.post(`/combos/${id}/approve`);
    return response.data;
  },

  async rejectCombo(id: string, comment: string) {
    const response = await api.post(`/combos/${id}/reject`, { comment });
    return response.data;
  },

  async requestComboChanges(id: string, comment: string) {
    const response = await api.post(`/combos/${id}/request-changes`, { comment });
    return response.data;
  },

  async activateCombo(id: string) {
    const response = await api.post(`/combos/${id}/activate`);
    return response.data;
  },

  async pauseCombo(id: string) {
    const response = await api.post(`/combos/${id}/pause`);
    return response.data;
  },

  async cancelCombo(id: string) {
    const response = await api.post(`/combos/${id}/cancel`);
    return response.data;
  },

  async deleteCombo(id: string) {
    const response = await api.delete(`/combos/${id}`);
    return response.data;
  },

  async getComboPerformanceSummary() {
    const response = await api.get('/combo-performance');
    return response.data;
  },

  async getSingleComboPerformance(comboId: string) {
    const response = await api.get(`/combo-performance/${comboId}`);
    return response.data;
  },

  async getPublicActiveCombos() {
    const response = await api.get('/public/combos');
    return response.data;
  },

  async getPosActiveCombos() {
    const response = await api.get('/pos/active-combos');
    return response.data;
  }
};
