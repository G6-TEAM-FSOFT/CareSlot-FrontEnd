import React from 'react';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

export const ClinicDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Clinic Partner Management Portal</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Ca Khám Hôm Nay</span>
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-2">24</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Đã Check-in</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">18</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Đang Giữ Slot (Held)</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">3</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Bác Sĩ Đang Làm Việc</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-2">6</p>
        </div>
      </div>
    </div>
  );
};
