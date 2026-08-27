import React from 'react';
import { Search, Sparkles, MapPin, CalendarCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 backdrop-blur-md border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Nền tảng đặt lịch khám đa phòng khám CareSlot
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            Đặt Lịch Khám Nhanh <br /><span className="text-emerald-400">Giữ Ca Trống Tức Thì</span>
          </h1>
          <p className="text-indigo-200 text-base mb-8">
            Tìm kiếm phòng khám uy tín, so sánh giá dịch vụ, AI gợi ý chuyên khoa phù hợp và thanh toán đặt cọc xác nhận lịch chỉ trong vài thao tác.
          </p>

          {/* Quick Search */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <div className="flex-1 flex items-center px-4 bg-white/10 rounded-xl text-white">
              <Search className="w-5 h-5 text-indigo-300 mr-2" />
              <input
                type="text"
                placeholder="Nhập tên phòng khám, chuyên khoa..."
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-indigo-300 text-sm py-2.5"
              />
            </div>
            <Link
              to="/clinics"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center justify-center transition"
            >
              Tìm Kiếm
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">AI Specialty Suggestion</h3>
            <p className="text-slate-500 text-sm">Nhập mô tả triệu chứng, AI tự động phân tích và đề xuất chuyên khoa khám chính xác.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Hold Slot 10 Phút</h3>
            <p className="text-slate-500 text-sm">Hệ thống tạm giữ ca khám trong 10 phút để người dùng hoàn tất thanh toán deposit an toàn.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Xác Nhận Check-in</h3>
            <p className="text-slate-500 text-sm">Bệnh nhân chỉ cần đến đúng ca và thực hiện Check-in trực tiếp tại Clinic Partner.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
