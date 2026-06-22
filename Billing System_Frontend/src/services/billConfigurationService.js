import api from './api';

export const billConfigurationService = {
  getConfiguration: async () => {
    const response = await api.get('/billconfiguration/me');
    return response.data;
  },

  saveConfiguration: async (configData) => {
    const response = await api.post('/billconfiguration/save', configData);
    return response.data;
  },

  uploadImage: async (file, position) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/billconfiguration/upload-image?position=${position}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadQrCode: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/billconfiguration/upload-qr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
