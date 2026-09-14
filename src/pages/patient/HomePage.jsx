import React from 'react';
import { Search, Calendar, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Ultra-Simple Clean Hero Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 text-slate-900 shadow-xs space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1 rounded-lg">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            Hệ Thống Đặt Lịch Khám Ngoại Trú CareSlot
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Đặt Lịch Khám Bệnh Nhanh &amp; Giữ Slot Khám Tức Thì
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-2xl leading-relaxed">
            Tra cứu thông tin phòng khám, chọn bác sĩ chuyên khoa và đăng ký ca khám chủ động mà không phải xếp hàng chờ đợi.
          </p>
        </div>

        {/* Simple Direct Action & Search Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/clinics"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>XEM DANH SÁCH PHÒNG KHÁM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Minimalist 3-Step Feature Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>1. Chọn Ca Khám</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Đăng ký khung giờ phù hợp với bác sĩ chuyên khoa mong muốn.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>2. Đặt Cọc Giữ Slot</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Hệ thống tạm giữ ca khám 10 phút để xác nhận lịch hẹn chính thức.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>3. Check-in &amp; Khám</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Đến đúng giờ và đọc mã lịch hẹn tại quầy Lễ tân tiếp đón.
          </p>
        </div>
      </section>
    </div>
  );
};
