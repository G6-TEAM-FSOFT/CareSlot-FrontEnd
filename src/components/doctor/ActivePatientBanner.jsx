import React from 'react';
import { User, History } from 'lucide-react';

export default function ActivePatientBanner({
  visit,
  selectedEncounter,
  patientHistoryCount,
  onOpenPatientProfile,
  onOpenMedicalHistory
}) {
  if (!visit) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-teal-700 font-bold uppercase">VISIT: {visit.visitCode}</span>
          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${visit.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
            {visit.status === 'COMPLETED' ? 'ĐÃ HOÀN TẤT ĐỢT KHÁM' : 'ĐANG KHÁM LÂM SÀNG'}
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{visit.patientName}</h2>
        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 mt-1">
          <span>Số STT: <strong className="text-amber-700 font-mono">{selectedEncounter?.queueNumber}</strong></span>
          <span>•</span>
          <span>Giới tính: <strong>{visit.patientGender === 'MALE' ? 'Nam' : 'Nữ'}</strong></span>
          <span>•</span>
          <span>SĐT: <strong className="text-teal-700 font-mono">{visit.patientPhone}</strong></span>
          <span>•</span>
          <span>Ngày sinh: <strong>{visit.patientDob || 'N/A'}</strong></span>
        </div>

        {/* Doctor Actions Toolbar */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={onOpenPatientProfile}
            className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs rounded-xl border border-cyan-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-cyan-600" />
            <span>Thông Tin Hồ Sơ Bệnh Nhân</span>
          </button>
          <button
            type="button"
            onClick={onOpenMedicalHistory}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lịch Sử Khám Bệnh ({patientHistoryCount || 0})</span>
          </button>
        </div>
      </div>

      <div className="text-right text-xs text-slate-500">
        <div>Mã Booking: <strong className="text-teal-700 font-mono">{visit.bookingCode}</strong></div>
        <div>Bác sĩ: <strong className="text-emerald-700 font-semibold">{visit.primaryDoctorName}</strong></div>
      </div>
    </div>
  );
}
