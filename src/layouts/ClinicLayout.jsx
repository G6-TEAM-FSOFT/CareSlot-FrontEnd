import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const ClinicLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col">
        <h2 className="text-white font-bold text-lg mb-8">Clinic Partner Portal</h2>
        <nav className="space-y-3 flex-grow">
          <Link to="/clinic/dashboard" className="block px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">Dashboard</Link>
          <Link to="/clinic/schedule" className="block px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">Quản lý Lịch Làm Việc</Link>
          <Link to="/clinic/appointments" className="block px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">Danh Sách Lịch Khám</Link>
        </nav>
        <Link to="/" className="text-xs text-indigo-400 hover:underline">← Quay lại trang Patient</Link>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
