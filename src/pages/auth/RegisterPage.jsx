import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    navigate('/auth/login');
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Tạo Tài Khoản CareSlot</h3>
      <p className="text-sm text-slate-500 mb-6">Đặt lịch khám nhanh chóng tại hàng trăm phòng khám đối tác</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tên tài khoản</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="example@mail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="0987654321"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
        >
          Đăng Ký Tài Khoản
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Đã có tài khoản?{' '}
        <Link to="/auth/login" className="text-indigo-600 font-semibold hover:underline">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};
