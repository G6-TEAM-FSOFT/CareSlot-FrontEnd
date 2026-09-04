import React from 'react';
import { MapPin, Phone, Star, ShieldCheck, ArrowRight, Building2, Stethoscope, Clock, Navigation, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClinicCard = ({ clinic }) => {
  // Format Consultation Fee
  const renderFee = () => {
    const min = clinic.minConsultationFee;
    const max = clinic.maxConsultationFee;
    if (min != null && max != null) {
      if (min === max) {
        return `${Number(min).toLocaleString()} VNĐ`;
      }
      return `${Number(min).toLocaleString()} - ${Number(max).toLocaleString()} VNĐ`;
    }
    if (min != null) return `Từ ${Number(min).toLocaleString()} VNĐ`;
    return 'Liên hệ phòng khám';
  };

  // Format Earliest Available Slot safely (handles ISO strings and Jackson array [yyyy, MM, dd, HH, mm])
  const formatEarliestSlot = (slotValue) => {
    if (!slotValue) return null;
    try {
      let slotDate;
      if (Array.isArray(slotValue)) {
        const [year, month, day, hour = 0, minute = 0] = slotValue;
        slotDate = new Date(year, month - 1, day, hour, minute);
      } else {
        slotDate = new Date(slotValue);
      }

      if (isNaN(slotDate.getTime())) {
        return null;
      }

      const now = new Date();
      const isToday =
        slotDate.getDate() === now.getDate() &&
        slotDate.getMonth() === now.getMonth() &&
        slotDate.getFullYear() === now.getFullYear();

      const timeStr = slotDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `${timeStr} Hôm nay`;
      }
      const dateStr = slotDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${timeStr}, ${dateStr}`;
    } catch {
      return null;
    }
  };

  const earliestSlotText = formatEarliestSlot(clinic.earliestAvailableSlot);
  const specialties = clinic.specialtyNames || [];
  const formattedDistance = clinic.distanceKm != null ? Number(clinic.distanceKm).toFixed(1) : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition duration-200 flex flex-col md:flex-row justify-between gap-6 group">
      {/* Left info column */}
      <div className="space-y-3 flex-grow">
        <div className="flex flex-wrap items-center gap-2">
          {formattedDistance != null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
              <Navigation className="w-3 h-3 text-sky-600" /> Cách bạn {formattedDistance} km
            </span>
          )}
        </div>

        <div>
          <Link
            to={`/booking?clinicId=${clinic.id}`}
            className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            <Building2 className="w-5 h-5 text-indigo-500 shrink-0 hidden sm:inline" />
            {clinic.name}
          </Link>
          <p className="flex items-start text-xs text-slate-500 mt-1.5 leading-relaxed">
            <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0 mt-0.5" />
            <span>{clinic.address}</span>
          </p>
        </div>

        {/* Specialty tags */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {specialties.slice(0, 3).map((spec, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200/60"
              >
                {spec}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                +{specialties.length - 3} khoa khác
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {clinic.description && (
          <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{clinic.description}"
          </p>
        )}

        {/* Contact info & Consultation fee */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
          {clinic.phone && (
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{clinic.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50/70 px-2 py-0.5 rounded-lg border border-indigo-100">
            <Banknote className="w-3.5 h-3.5 text-indigo-600" />
            <span>Giá khám: {renderFee()}</span>
          </div>
        </div>
      </div>

      {/* Right action column */}
      <div className="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[220px] shrink-0">
        <div className="text-left md:text-right w-full">
          <div className="inline-block md:block bg-slate-50 border border-slate-200/80 rounded-xl p-3 w-full space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Ca khám khả dụng</p>
            {earliestSlotText ? (
              <p className="text-xs font-bold text-emerald-600 flex items-center md:justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <Clock className="w-3.5 h-3.5" />
                {earliestSlotText}
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-400 flex items-center md:justify-end gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Đang cập nhật lịch
              </p>
            )}
          </div>
        </div>

        <div className="w-full mt-4 space-y-2">
          <Link
            to={`/booking?clinicId=${clinic.id}`}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-center text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            Xem Lịch & Đặt Khám
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
