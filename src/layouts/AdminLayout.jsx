import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-white font-bold text-lg mb-8 tracking-tight">CareSlot Admin</h2>
          <nav className="space-y-2">
            <Link to="/admin/dashboard" className="block px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-medium transition">Dashboard</Link>
            <Link to="/admin/users" className="block px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-medium transition">Quản lý Người Dùng</Link>
            <Link to="/admin/clinics" className="block px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-medium transition">Duyệt Phòng Khám</Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
