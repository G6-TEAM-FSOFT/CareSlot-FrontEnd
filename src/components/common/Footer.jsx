import React from 'react';
import { Stethoscope } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-xl mb-4">
            <Stethoscope className="w-6 h-6 text-indigo-400" />
            <span>CareSlot</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Nền tảng tìm kiếm và đặt lịch khám đa phòng khám trực tuyến nhanh chóng, tiện lợi và an toàn.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Dành Cho Bệnh Nhân</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-white transition">Tìm phòng khám</a></li>
            <li><a href="#" className="hover:text-white transition">AI gợi ý chuyên khoa</a></li>
            <li><a href="#" className="hover:text-white transition">Quy trình giữ ca & Đặt cọc</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Dành Cho Đối Tác</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-white transition">Đăng ký Clinic Partner</a></li>
            <li><a href="#" className="hover:text-white transition">Quản lý lịch làm việc bác sĩ</a></li>
            <li><a href="#" className="hover:text-white transition">Xác nhận Patient Check-in</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Liên Hệ & Hỗ Trợ</h4>
          <p className="text-sm text-slate-400">Hotline: 1900 8888</p>
          <p className="text-sm text-slate-400">Email: support@careslot.vn</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} CareSlot Platform. All rights reserved.
      </div>
    </footer>
  );
};
