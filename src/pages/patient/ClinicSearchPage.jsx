import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Stethoscope, Filter, Building2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { clinicService, specialtyService } from '../../services/clinicService';
import { ClinicCard } from '../../components/clinic/ClinicCard';
import { ClinicFilterSidebar } from '../../components/clinic/ClinicFilterSidebar';
import { Pagination } from '../../components/common/Pagination';

export const ClinicSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state initialization
  const initialKeyword = searchParams.get('keyword') || '';
  const initialSpecialtyId = searchParams.get('specialtyId') ? Number(searchParams.get('specialtyId')) : '';
  const initialLocation = searchParams.get('location') || '';
  const initialPage = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  // Local filter states
  const [keyword, setKeyword] = useState(initialKeyword);
  const [specialtyId, setSpecialtyId] = useState(initialSpecialtyId);
  const [location, setLocation] = useState(initialLocation);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(10);

  // Data states
  const [clinics, setClinics] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile filter drawer state
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Fetch Specialties for filter options on mount
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const res = await specialtyService.getAllSpecialties();
        const data = res?.data || res || [];
        setSpecialties(Array.isArray(data) ? data : data.content || []);
      } catch (err) {
        console.error('Lỗi tải danh sách chuyên khoa:', err);
      }
    };
    loadSpecialties();
  }, []);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback((newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.keyword) params.set('keyword', newFilters.keyword);
    if (newFilters.specialtyId) params.set('specialtyId', newFilters.specialtyId.toString());
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.page && newFilters.page > 0) params.set('page', newFilters.page.toString());

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch clinics from Backend API
  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: pageSize,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (specialtyId) params.specialtyId = specialtyId;
      if (location.trim()) params.location = location.trim();

      const response = await clinicService.getAllClinics(params);
      const resData = response?.data || response;

      if (resData && Array.isArray(resData.content)) {
        setClinics(resData.content);
        setTotalPages(resData.totalPages || 0);
        setTotalElements(resData.totalElements || 0);
      } else if (Array.isArray(resData)) {
        setClinics(resData);
        setTotalPages(1);
        setTotalElements(resData.length);
      } else {
        setClinics([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm phòng khám:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [keyword, specialtyId, location, page, pageSize]);

  // Debounced trigger for search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlParams({ keyword, specialtyId, location, page });
      fetchClinics();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, specialtyId, location, page, updateUrlParams, fetchClinics]);

  // Handlers
  const handleKeywordChange = (val) => {
    setKeyword(val);
    setPage(0);
  };

  const handleSpecialtyChange = (val) => {
    setSpecialtyId(val);
    setPage(0);
  };

  const handleLocationChange = (val) => {
    setLocation(val);
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSpecialtyId('');
    setLocation('');
    setPage(0);
  };

  const selectedSpecialtyObj = specialties.find((s) => s.id === specialtyId);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Summary */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-100 border border-white/20">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            Mạng Lưới Đối Tác Y Tế CareSlot
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tìm Kiếm & Đặt Lịch Phòng Khám Uy Tín
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-2xl">
            Lựa chọn phòng khám đạt chuẩn, xem bác sĩ theo chuyên khoa và giữ lịch khám nhanh chóng với mức cọc bảo đảm minh bạch.
          </p>

          {/* Quick Stats or Active filter badges */}
          {(keyword || specialtyId || location) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-indigo-200">Đang lọc theo:</span>
              {keyword && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Từ khóa: <strong className="text-white">"{keyword}"</strong>
                  <button onClick={() => handleKeywordChange('')} className="hover:text-rose-300 ml-1">×</button>
                </span>
              )}
              {selectedSpecialtyObj && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Khoa: <strong className="text-white">{selectedSpecialtyObj.name}</strong>
                  <button onClick={() => handleSpecialtyChange('')} className="hover:text-rose-300 ml-1">×</button>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Khu vực: <strong className="text-white">{location}</strong>
                  <button onClick={() => handleLocationChange('')} className="hover:text-rose-300 ml-1">×</button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-200 hover:text-white underline font-semibold cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Main Layout: Left Sidebar Filter + Right Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mobile filter toggle bar */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <Filter className="w-4 h-4 text-indigo-600" />
            Bộ lọc tìm kiếm
            {(keyword || specialtyId || location) && (
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>
          <span className="text-xs text-slate-500 font-medium">
            <strong className="text-indigo-600 font-bold">{totalElements}</strong> phòng khám
          </span>
        </div>

        {/* Desktop Filter Sidebar (Left 4 cols) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24">
          <ClinicFilterSidebar
            keyword={keyword}
            onKeywordChange={handleKeywordChange}
            specialtyId={specialtyId}
            onSpecialtyChange={handleSpecialtyChange}
            location={location}
            onLocationChange={handleLocationChange}
            specialties={specialties}
            onResetFilters={handleResetFilters}
            totalResults={totalElements}
          />
        </aside>

        {/* Mobile Filter Drawer / Modal */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end lg:hidden">
            <div className="bg-white w-full max-w-sm h-full p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Bộ lọc tìm kiếm</h3>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ClinicFilterSidebar
                keyword={keyword}
                onKeywordChange={handleKeywordChange}
                specialtyId={specialtyId}
                onSpecialtyChange={handleSpecialtyChange}
                location={location}
                onLocationChange={handleLocationChange}
                specialties={specialties}
                onResetFilters={handleResetFilters}
                totalResults={totalElements}
              />

              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Xem {totalElements} kết quả
              </button>
            </div>
          </div>
        )}

        {/* Clinic Cards Results Column (Right 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Results count header */}
          <div className="hidden lg:flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-600 font-medium">
              Tìm thấy <strong className="text-indigo-600 font-bold">{totalElements}</strong> cơ sở y tế đang hoạt động
            </span>
            <span className="text-xs text-slate-400">
              Trang {page + 1} / {Math.max(1, totalPages)}
            </span>
          </div>

          {/* Loading Skeleton state */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-28 bg-slate-200 rounded-full" />
                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded-lg" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">{error}</h4>
              <button
                onClick={fetchClinics}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Thử lại
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && clinics.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Không tìm thấy phòng khám phù hợp</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Không có kết quả nào khớp với các tiêu chí tìm kiếm hiện tại của bạn. Hãy thử thay đổi từ khóa hoặc xóa bớt bộ lọc.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          )}

          {/* Clinic List */}
          {!loading && !error && clinics.length > 0 && (
            <div className="space-y-4">
              {clinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
