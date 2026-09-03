import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo login for base structure verification
    login({ username: username || 'patient_demo', role: 'ROLE_PATIENT' }, 'mock-jwt-token');
    navigate('/patient/profile');
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Đăng Nhập CareSlot</h3>
      <p className="text-sm text-slate-500 mb-6">Nhập thông tin tài khoản của bạn để tiếp tục</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập / Email</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="nhap@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
        >
          Đăng Nhập
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link to="/auth/register" className="text-indigo-600 font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
