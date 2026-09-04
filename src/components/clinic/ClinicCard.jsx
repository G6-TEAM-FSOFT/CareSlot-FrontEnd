import React from 'react';
import { MapPin, Phone, Star, ShieldCheck, ArrowRight, Building2, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClinicCard = ({ clinic }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition duration-200 flex flex-col md:flex-row justify-between gap-6 group">
      {/* Left info column */}
      <div className="space-y-3 flex-grow">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Đối Tác Xác Thực
          </span>
          <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 (120+ đánh giá)
          </span>
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

        {/* Description */}
        {clinic.description && (
          <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{clinic.description}"
          </p>
        )}

        {/* Contact info & tags */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
          {clinic.phone && (
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{clinic.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right action column */}
      <div className="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[220px] shrink-0">
        <div className="text-left md:text-right w-full">
          <div className="inline-block md:block bg-indigo-50/70 border border-indigo-100/80 rounded-xl p-2.5 w-full">
            <p className="text-[11px] font-semibold text-slate-500">Đặt lịch trực tuyến</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center md:justify-end gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Ca khám khả dụng hôm nay
            </p>
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
