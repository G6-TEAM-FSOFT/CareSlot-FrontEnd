import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Stethoscope, User, LogOut, Calendar, Sparkles } from 'lucide-react';
import { ROLES } from '../../config/constants';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Stethoscope className="w-6 h-6 text-indigo-600" />
          </div>
          <span>Care<span className="text-emerald-500">Slot</span></span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-indigo-600 transition">Trang chủ</Link>
          <Link to="/clinics" className="hover:text-indigo-600 transition">Tìm Phòng Khám</Link>
          <Link to="/booking" className="hover:text-indigo-600 transition">Đặt Khám Bác Sĩ</Link>
          <Link to="/patients" className="hover:text-indigo-600 transition">Hồ Sơ Bệnh Nhân</Link>
          <Link to="/history" className="hover:text-indigo-600 transition">Lịch Khám Đã Đặt</Link>
          <Link to="/ai-suggest" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold bg-indigo-50 px-3 py-1.5 rounded-full transition">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI Gợi Ý Khám
          </Link>
        </nav>


        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/history" className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-indigo-600 transition">
                <Calendar className="w-4 h-4" />
                Lịch sử đặt
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/auth/login');
                }}
                className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/auth/login" className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5">
                Đăng nhập
              </Link>
              <Link
                to="/auth/register"
                className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
