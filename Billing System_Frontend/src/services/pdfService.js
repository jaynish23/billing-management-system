import api from './api';

export const pdfService = {
  exportLedger: async (type, id, lang = 'en') => {
    const response = await api.get(`/pdf/export-ledger?type=${type}&id=${id}&lang=${lang}`, {
      responseType: 'blob',
    });
    return response.data;
  }
};
