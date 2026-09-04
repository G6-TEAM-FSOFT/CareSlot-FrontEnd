import React from 'react';
import { Search, MapPin, Stethoscope, RotateCcw, Filter, Check } from 'lucide-react';

const COMMON_LOCATIONS = [
  'Tất cả khu vực',
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đống Đa',
  'Cầu Giấy',
  'Ba Đình',
  'Hai Bà Trưng',
  'Quận 1',
  'Quận 5',
  'Quận 10',
];

export const ClinicFilterSidebar = ({
  keyword,
  onKeywordChange,
  specialtyId,
  onSpecialtyChange,
  location,
  onLocationChange,
  specialties = [],
  onResetFilters,
  totalResults = 0,
}) => {
  const hasActiveFilters = Boolean(keyword || specialtyId || location);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Bộ Lọc Tìm Kiếm</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
            title="Đặt lại toàn bộ bộ lọc"
          >
            <RotateCcw className="w-3 h-3" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* 1. Tìm kiếm theo tên / từ khóa */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          Tên phòng khám / Địa chỉ
        </label>
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="VD: BV Đại học Y, Medlatec..."
            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {keyword && (
            <button
              onClick={() => onKeywordChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 2. Lọc theo chuyên khoa */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
          Chuyên khoa
        </label>
        <select
          value={specialtyId || ''}
          onChange={(e) => onSpecialtyChange(e.target.value ? Number(e.target.value) : '')}
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="">-- Tất cả chuyên khoa --</option>
          {specialties.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Lọc theo khu vực */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Khu vực / Địa bàn
        </label>
        <div className="relative">
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="VD: Cầu Giấy, Đống Đa, Hà Nội..."
            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {location && (
            <button
              onClick={() => onLocationChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Quick location pills */}
        <div className="flex flex-wrap gap-1 pt-1.5">
          {['Hà Nội', 'TP. Hồ Chí Minh', 'Cầu Giấy', 'Đống Đa'].map((loc) => {
            const isSelected = location.toLowerCase() === loc.toLowerCase();
            return (
              <button
                key={loc}
                type="button"
                onClick={() => onLocationChange(isSelected ? '' : loc)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary box */}
      <div className="pt-2 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Tìm thấy <span className="font-bold text-indigo-600">{totalResults}</span> kết quả phù hợp
        </p>
      </div>
    </div>
  );
};
