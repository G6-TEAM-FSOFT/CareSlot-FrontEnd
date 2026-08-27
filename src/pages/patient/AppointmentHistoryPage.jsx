import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

const MOCK_APPOINTMENTS = [
  {
    id: 1,
    code: 'CS-889021',
    clinicName: 'Phòng Khám Đa Khoa CareSlot Central',
    doctorName: 'BS. CKII Nguyễn Văn A',
    slotTime: '09:00 - 09:30 (28/08/2026)',
    status: 'CONFIRMED',
    depositPaid: '50.000 VNĐ',
  },
  {
    id: 2,
    code: 'CS-889022',
    clinicName: 'Trung Tâm Y Khoa International Care',
    doctorName: 'ThS. BS Trần Thị B',
    slotTime: '14:00 - 14:30 (15/08/2026)',
    status: 'CHECKED_IN',
    depositPaid: '100.000 VNĐ',
  },
];

export const AppointmentHistoryPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Lịch Sử Đặt Lịch Khám</h2>
        <p className="text-sm text-slate-500">Theo dõi tiến trình từ HELD → PENDING_PAYMENT → CONFIRMED → CHECKED_IN</p>
      </div>

      <div className="space-y-4">
        {MOCK_APPOINTMENTS.map((app) => (
          <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-md font-bold text-slate-700">{app.code}</span>
                {app.status === 'CONFIRMED' && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Xác Nhận Booking
                  </span>
                )}
                {app.status === 'CHECKED_IN' && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Check-in Tại Clinic
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{app.clinicName}</h3>
              <p className="text-sm text-slate-600 font-medium">{app.doctorName}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" /> {app.slotTime}
              </p>
            </div>

            <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
              <div className="text-right">
                <p className="text-xs text-slate-400">Tiền cọc đã trả</p>
                <p className="text-base font-bold text-indigo-600">{app.depositPaid}</p>
              </div>
              <button className="text-xs font-medium text-slate-500 hover:text-rose-600 underline mt-3">
                Hủy Lịch Khám
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
