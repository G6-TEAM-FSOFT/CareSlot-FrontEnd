import api from '../../config/axios';

export const partnerClinicService = {
  getClinicProfile: async () => {
    return await api.get('/partner/clinic');
  },
  updateClinicProfile: async (clinicData) => {
    return await api.put('/partner/clinic', clinicData);
  },
};
