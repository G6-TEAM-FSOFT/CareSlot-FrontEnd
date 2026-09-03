import api from '../../config/axios';

export const partnerSlotService = {
  getSlots: async (params = {}) => {
    return await api.get('/partner/slots', { params });
  },
  createSingleSlot: async (slotData) => {
    return await api.post('/partner/slots', slotData);
  },
  createBatchSlots: async (batchData) => {
    return await api.post('/partner/slots/batch', batchData);
  },
  importExcelSchedule: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/partner/slots/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
