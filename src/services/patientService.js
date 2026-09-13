import api from '../config/axios';

const MOCK_PRIMARY_PROFILE_KEY = 'care_slot_mock_primary_profile';

const INITIAL_MOCK_PROFILE = {
  fullName: 'Nguyễn Kiều Tùng Dương',
  dateOfBirth: '2004-12-25',
  gender: 'MALE',
  phone: '0984634913',
};

export const patientService = {
  // Primary Profile APIs
  getPrimaryProfile: async () => {
    return await api.get('/patients/me/primary');
  },

  updatePrimaryProfile: async (profileData) => {
    return await api.put('/patients/me/primary', profileData);
  },

  // Patient / Relative Profiles APIs
  getPatients: async (keyword = '') => {
    const params = keyword ? { keyword } : {};
    return await api.get('/patients', { params });
  },

  getPatientById: async (id) => {
    return await api.get(`/patients/${id}`);
  },

  createPatient: async (patientData) => {
    return await api.post('/patients', patientData);
  },

  updatePatient: async (id, patientData) => {
    const payload = {
      fullName: patientData.fullName ? patientData.fullName.trim() : '',
      phone: patientData.phone ? patientData.phone.trim() : null,
      dateOfBirth: patientData.dateOfBirth && patientData.dateOfBirth.trim() !== '' ? patientData.dateOfBirth : null,
      gender: patientData.gender ? patientData.gender : 'MALE',
      identityCard: patientData.identityCard && patientData.identityCard.trim() !== '' ? patientData.identityCard.trim() : null,
      cardIssueDate: patientData.cardIssueDate && patientData.cardIssueDate.trim() !== '' ? patientData.cardIssueDate : null,
      ethnicity: patientData.ethnicity && patientData.ethnicity.trim() !== '' ? patientData.ethnicity.trim() : null,
      nationality: patientData.nationality && patientData.nationality.trim() !== '' ? patientData.nationality.trim() : null,
      occupation: patientData.occupation && patientData.occupation.trim() !== '' ? patientData.occupation.trim() : null,
      address: patientData.address && patientData.address.trim() !== '' ? patientData.address.trim() : null,
      relationship: patientData.relationship && patientData.relationship.trim() !== '' ? patientData.relationship.trim() : null,
    };
    return await api.put(`/patients/${id}`, payload);
  },

  deletePatient: async (id) => {
    return await api.delete(`/patients/${id}`);
  },
};
