import api from '../../config/axios';

export const partnerSpecialtyService = {
  getClinicSpecialties: async () => {
    return await api.get('/partner/clinic/specialties');
  },
  addSpecialty: async (specialtyId) => {
    return await api.post(`/partner/clinic/specialties/${specialtyId}`);
  },
  removeSpecialty: async (specialtyId) => {
    return await api.delete(`/partner/clinic/specialties/${specialtyId}`);
  },
  getAllSystemSpecialties: async () => {
    return await api.get('/specialties');
  },
};
