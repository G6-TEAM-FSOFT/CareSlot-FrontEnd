import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';
import { Hospital, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('staff@clinic.com');
  const [password, setPassword] = useState('123456');
  const [selectedRole, setSelectedRole] = useState(ROLES.CLINIC_STAFF);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      id: 1,
      username: username || 'clinic_staff',
      fullName: selectedRole === ROLES.CLINIC_STAFF ? 'Quản lý Phòng khám' : username,
      email: username,
      role: selectedRole,
      clinicId: 1,
    };

    login(userData, 'mock-jwt-token-care-slot');

    if (selectedRole === ROLES.CLINIC_STAFF || selectedRole === ROLES.CLINIC) {
      navigate('/clinic-partner/profile');
    } else if (selectedRole === ROLES.ADMIN) {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleQuickLoginStaff = () => {
    const staffData = {
      id: 1,
      username: 'clinic_partner_staff',
      fullName: 'Bùi Thị Mai (Clinic Staff)',
      email: 'staff@clinic.com',
      role: ROLES.CLINIC_STAFF,
      clinicId: 1,
    };
    login(staffData, 'mock-jwt-token-partner-staff');
    navigate('/clinic-partner/profile');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Đăng Nhập CareSlot</h3>
        <p className="text-xs text-slate-500">Chọn vai trò hệ thống và đăng nhập để bắt đầu trải nghiệm</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSelectedRole(ROLES.CLINIC_STAFF)}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition ${selectedRole === ROLES.CLINIC_STAFF
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Hospital className="w-3.5 h-3.5" />
          <span>Clinic Staff</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole(ROLES.PATIENT)}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition ${selectedRole === ROLES.PATIENT
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Bệnh nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole(ROLES.ADMIN)}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition ${selectedRole === ROLES.ADMIN
              ? 'bg-slate-800 text-white shadow'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tên đăng nhập / Email</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="nhap@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-md transition"
        >
          Đăng Nhập với vai trò ({selectedRole})
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/auth/register" className="text-cyan-600 font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
