import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { ROLES } from '../../config/constants';
import { Hospital, UserCheck, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await login({ email, password });
      const authData = response?.data || response;

      if (authData?.role === ROLES.RECEPTIONIST) {
        navigate('/outpatient/receptionist');
      } else if (authData?.role === ROLES.CLINICAL_ASSISTANT || authData?.role === ROLES.DOCTOR) {
        navigate('/outpatient/doctor');
      } else if (authData?.role === ROLES.TECHNICIAN) {
        navigate('/outpatient/technician');
      } else if (authData?.role === ROLES.CLINIC_PARTNER || authData?.role === ROLES.CLINIC_STAFF || authData?.role === ROLES.CLINIC_ADMIN) {
        navigate('/clinic-partner/profile');
      } else if (authData?.role === ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || err?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra Email và Mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillAccount = (accountEmail, accountPassword) => {
    setEmail(accountEmail);
    setPassword(accountPassword);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Đăng Nhập CareSlot System</h3>
        <p className="text-xs text-slate-500">Chọn tài khoản mẫu theo Role hoặc nhập email/mật khẩu của bạn</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Accounts Quick Pickers */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tài khoản thử nghiệm theo Role:</div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => fillAccount('receptionist.tonthattung@careslot.vn', '123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-cyan-500 hover:text-cyan-600 text-left transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span className="truncate">Lễ tân & Thu ngân</span>
          </button>
          <button
            type="button"
            onClick={() => fillAccount('doctor.minh@careslot.vn', '123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 text-left transition flex items-center gap-1.5"
          >
            <Hospital className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">BS. Hoàng Minh</span>
          </button>
          <button
            type="button"
            onClick={() => fillAccount('tech.lab@careslot.vn', '123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-amber-500 hover:text-amber-600 text-left transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">KTV Cận lâm sàng</span>
          </button>
          <button
            type="button"
            onClick={() => fillAccount('nguyenvanan@example.com', '123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 text-left transition flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Bệnh nhân (Văn An)</span>
          </button>
          <button
            type="button"
            onClick={() => fillAccount('staff1@careslot.vn', '123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 text-left transition flex items-center gap-1.5"
            title="Nhân viên Clinic Partner (staff1@careslot.vn)"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">Clinic Staff (Đối tác)</span>
          </button>
          <button
            type="button"
            onClick={() => fillAccount('admin@careslot.vn', '123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-800 hover:text-slate-900 text-left transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-800 shrink-0" />
            <span className="truncate">System Admin</span>
          </button>
          <button
            type="button"
            onClick={() => fillAccount('staff1@careslot.vn', '123456')}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-800 hover:text-slate-900 text-left transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-800 shrink-0" />
            <span className="truncate">Clinic Staff</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email tài khoản</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          disabled={submitting}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md transition"
        >
          {submitting ? 'Đang xác thực...' : 'Đăng Nhập'}
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
