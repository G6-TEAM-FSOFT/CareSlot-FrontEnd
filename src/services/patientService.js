import api from '../config/axios';

const MOCK_PRIMARY_PROFILE_KEY = 'care_slot_mock_primary_profile';

const INITIAL_MOCK_PROFILE = {
  fullName: 'Nguyễn Kiều Tùng Dương',
  dateOfBirth: '2004-12-25',
  gender: 'MALE',
  phone: '0984634913',
};

export const patientService = {
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
};

