import React from 'react';
import { User, X } from 'lucide-react';

export default function DoctorPatientProfileModal({
  show,
  patientDetail,
  visit,
  selectedEncounter,
  onClose
}) {
  if (!show) return null;
  const p = patientDetail || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn space-y-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Hồ Sơ Chi Tiết Bệnh Nhân</h3>
              <p className="text-xs text-teal-100 font-mono">
                Mã hồ sơ: PAT-{(p.id || visit?.patientProfileId || selectedEncounter?.patientProfileId) ? String(p.id || visit?.patientProfileId || selectedEncounter?.patientProfileId).padStart(4, '0') : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          {!patientDetail ? (
            <div className="py-8 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải thông tin hồ sơ chi tiết...</span>
            </div>
          ) : (
            <>
              {/* Main Badge Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">
                    {p.fullName || visit?.patientName || selectedEncounter?.patientName || 'Chưa cập nhật'}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {p.gender === 'FEMALE' ? 'Nữ' : (p.gender === 'MALE' ? 'Nam' : (p.gender || 'Khác'))}
                    {p.dateOfBirth ? ` • ${p.dateOfBirth} (${new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} tuổi)` : ''}
                  </div>
                </div>
                {p.healthInsuranceCode ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300">
                    Thẻ BHYT: {p.healthInsuranceCode}
                  </span>
                ) : p.identityCard ? (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 font-mono">
                    CCCD: {p.identityCard}
                  </span>
                ) : null}
              </div>

              {/* Grid Information */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Số CCCD / Định danh:</span>
                  <strong className="text-slate-800 font-mono text-sm">{p.identityCard || 'Chưa cập nhật'}</strong>
                </div>

                <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Số Điện Thoại:</span>
                  <strong className="text-teal-700 font-mono text-sm">{p.phone || p.phoneNumber || visit?.patientPhone || selectedEncounter?.patientPhone || 'Chưa cập nhật'}</strong>
                </div>

                <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Dân tộc / Quốc tịch:</span>
                  <strong className="text-slate-800 text-xs">{p.ethnicity || 'Chưa cập nhật'} / {p.nationality || 'Việt Nam'}</strong>
                </div>

                <div className="space-y-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Nghề nghiệp:</span>
                  <strong className="text-slate-800 text-xs">{p.occupation || 'Chưa cập nhật'}</strong>
                </div>

                <div className="sm:col-span-2 space-y-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Địa chỉ đăng ký thường trú:</span>
                  <strong className="text-slate-800 text-xs">{p.address || 'Chưa cập nhật'}</strong>
                </div>

                <div className="sm:col-span-2 space-y-1 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Mối quan hệ hồ sơ / Ngày cấp thẻ:</span>
                  <strong className="text-slate-800 text-xs">
                    {p.relationship ? `Quan hệ: ${p.relationship}` : ''}
                    {p.cardIssueDate ? `${p.relationship ? ' • ' : ''}Ngày cấp: ${p.cardIssueDate}` : (!p.relationship ? 'Chưa cập nhật' : '')}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            Đóng Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
}
