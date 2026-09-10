import api from '../config/axios';

const MOCK_PRIMARY_PROFILE_KEY = 'care_slot_mock_primary_profile';

const INITIAL_MOCK_PROFILE = {
  fullName: 'Nguyễn Kiều Tùng Dương',
  dateOfBirth: '2004-12-25',
  gender: 'MALE',
  phone: '0984634913',
};

export const patientService = {
  // Primary Profile APIs (T-023)
  getPrimaryProfile: async () => {
    try {
      return await api.get('/patients/me/primary');
    } catch (error) {
      console.warn('API backend chưa kết nối hoặc chưa xác thực, sử dụng mock data để test UI:', error);
      const saved = localStorage.getItem(MOCK_PRIMARY_PROFILE_KEY);
      if (saved) {
        try {
          return { data: JSON.parse(saved) };
        } catch {
          // ignore parse error
        }
      }
      return { data: INITIAL_MOCK_PROFILE };
    }
  },

  updatePrimaryProfile: async (profileData) => {
    try {
      return await api.put('/patients/me/primary', profileData);
    } catch (error) {
      console.warn('API backend chưa kết nối hoặc chưa xác thực, lưu vào mock data local:', error);
      localStorage.setItem(MOCK_PRIMARY_PROFILE_KEY, JSON.stringify(profileData));
      // Simulate network delay for realistic UI test
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { data: profileData };
    }
  },

  // Patient / Relative Profiles APIs
  getPatients: async (keyword = '') => {
    const params = keyword ? { keyword } : {};
    return await api.get('/patients', { params });
  },

  getPatientById: async (id) => {
    try {
      return await api.get(`/patients/${id}`);
    } catch (error) {
      console.warn('API backend error, using local fallback for patient profile:', error);
      const key = `care_slot_patient_profile_${id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return { data: JSON.parse(saved) };
        } catch (e) {
          // ignore
        }
      }
      return { data: null };
    }
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
    try {
      return await api.put(`/patients/${id}`, payload);
    } catch (error) {
      console.warn('API backend error, saving patient profile to local storage fallback:', error);
      const key = `care_slot_patient_profile_${id}`;
      localStorage.setItem(key, JSON.stringify({ id, ...payload }));
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { data: { id, ...payload } };
    }
  },

  deletePatient: async (id) => {
    return await api.delete(`/patients/${id}`);
  },
};
