import React from 'react';

export const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">CareSlot Admin Dashboard</h2>
      <p className="text-sm text-slate-500">Tổng quan hệ thống người dùng, phòng khám đối tác và chuyên khoa</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700">Tổng Phòng Khám Partner</h3>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">42</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700">Tổng Bệnh Nhân Đã Đăng Ký</h3>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">1,250</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-700">Tổng Booking Thành Công</h3>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">3,890</p>
        </div>
      </div>
    </div>
  );
};
