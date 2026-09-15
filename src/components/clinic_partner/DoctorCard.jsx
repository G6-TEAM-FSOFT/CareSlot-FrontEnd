import React from 'react';
import { Stethoscope, DollarSign, ToggleRight, ToggleLeft, Edit, Eye } from 'lucide-react';

export const DoctorCard = ({
  doctor,
  formatCurrency,
  onDetail,
  onToggleStatus,
  onEdit
}) => {
  return (
    <div className="bg-white border border-slate-200 hover:border-cyan-500 rounded-2xl p-6 transition duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div className="space-y-4">
        {/* Doctor Avatar & Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 overflow-hidden flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              {doctor.avatarUrl ? (
                <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{doctor.fullName?.charAt(0) || 'D'}</span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-cyan-700">{doctor.title || 'BS'}</span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{doctor.fullName}</h3>
            </div>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${doctor.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
              }`}
          >
            {doctor.status || 'ACTIVE'}
          </span>
        </div>

        {/* Specialty & Fee */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
              Chuyên khoa:
            </span>
            <span className="font-semibold text-slate-900">
              {doctor.specialtyName || doctor.specialty?.name || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Giá khám:
            </span>
            <span className="font-bold text-emerald-700">
              {formatCurrency(doctor.consultationFee)}
            </span>
          </div>
        </div>

        {/* Bio snippet */}
        {doctor.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
            "{doctor.bio}"
          </p>
        )}
      </div>

      {/* Actions Footer */}
      <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onDetail(doctor)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Chi tiết & Lịch hẹn</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStatus(doctor)}
            className={`p-1.5 text-xs rounded-lg border transition ${doctor.status === 'ACTIVE'
                ? 'text-amber-700 hover:bg-amber-50 border-amber-200'
                : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
              }`}
            title={doctor.status === 'ACTIVE' ? 'Tắt khám' : 'Bật khám'}
          >
            {doctor.status === 'ACTIVE' ? (
              <ToggleRight className="w-4 h-4 text-amber-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          <button
            onClick={() => onEdit(doctor)}
            className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            title="Sửa hồ sơ bác sĩ"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
