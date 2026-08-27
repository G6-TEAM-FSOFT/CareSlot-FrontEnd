import React, { useState } from 'react';
import { Search, MapPin, Star, Clock, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_CLINICS = [
  {
    id: 1,
    name: 'Phòng Khám Đa Khoa CareSlot Central',
    address: '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
    rating: 4.9,
    reviews: 128,
    specialties: ['Nội khoa', 'Thần kinh', 'Tim mạch'],
    price: 150000,
    deposit: 50000,
    earliestSlot: '09:00 Hôm nay',
  },
  {
    id: 2,
    name: 'Trung Tâm Y Khoa International Care',
    address: '45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh',
    rating: 4.8,
    reviews: 96,
    specialties: ['Da liễu', 'Xương khớp'],
    price: 200000,
    deposit: 100000,
    earliestSlot: '10:30 Hôm nay',
  },
];

export const ClinicSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tìm Kiếm Phòng Khám Đối Tác</h2>
          <p className="text-sm text-slate-500">Lọc theo vị trí, giá dịch vụ hoặc ca khám sớm nhất</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Lọc Theo Tiêu Chí
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_CLINICS.map((clinic) => (
          <div key={clinic.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">Active Partner</span>
                <span className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400" /> {clinic.rating} ({clinic.reviews})
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 hover:text-indigo-600 cursor-pointer">
                {clinic.name}
              </h3>
              <p className="flex items-center text-sm text-slate-500">
                <MapPin className="w-4 h-4 mr-1 text-slate-400" /> {clinic.address}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {clinic.specialties.map((s, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
              <div className="text-right">
                <p className="text-xs text-slate-400">Ca trống sớm nhất</p>
                <p className="text-sm font-semibold text-emerald-600 flex items-center justify-end gap-1">
                  <Clock className="w-4 h-4" /> {clinic.earliestSlot}
                </p>
                <p className="text-xs text-slate-400 mt-2">Đặt cọc giữ slot</p>
                <p className="text-base font-bold text-indigo-600">{clinic.deposit.toLocaleString()} VNĐ</p>
              </div>

              <Link
                to={`/clinics/${clinic.id}`}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-center text-sm transition"
              >
                Xem Lịch & Đặt Khám
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
