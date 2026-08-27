import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-6 flex items-center space-x-2 text-indigo-600 font-bold text-2xl">
        <Stethoscope className="w-8 h-8 text-indigo-600" />
        <span>Care<span className="text-emerald-500">Slot</span></span>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <Outlet />
      </div>
    </div>
  );
};

export const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col">
        <h2 className="text-white font-bold text-lg mb-8">CareSlot Admin</h2>
        <nav className="space-y-3 flex-grow">
          <Link to="/admin/dashboard" className="block px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">Dashboard</Link>
          <Link to="/admin/users" className="block px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">Quản lý Người Dùng</Link>
          <Link to="/admin/clinics" className="block px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">Duyệt Phòng Khám</Link>
        </nav>
        <Link to="/" className="text-xs text-indigo-400 hover:underline">← Trang Chủ</Link>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
