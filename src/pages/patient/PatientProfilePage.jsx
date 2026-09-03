import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Calendar,
  Phone,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Shield,
  Save,
  X,
  Users
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import { formatDateDisplay, getAvatarInitial } from '../../utils/formatters';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const GENDER_MAP = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export const PatientProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Helper to extract status and human message from API error
  const parseApiError = (err) => {
    const status = err?.status || err?.statusCode || err?.response?.status;
    const rawMessage = err?.message || err?.error || (typeof err === 'string' ? err : '');

    if (status === 401 || rawMessage?.includes?.('401') || rawMessage?.toLowerCase?.()?.includes('unauthorized')) {
      return {
        status: 401,
        message: 'Phiên đăng nhập chưa hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      };
    }
    if (status === 403 || rawMessage?.includes?.('403') || rawMessage?.toLowerCase?.()?.includes('forbidden')) {
      return {
        status: 403,
        message: 'Bạn không có quyền truy cập hồ sơ này.',
      };
    }
    if (status === 404 || rawMessage?.includes?.('404') || rawMessage?.toLowerCase?.()?.includes('not found')) {
      return {
        status: 404,
        message: 'Không tìm thấy hồ sơ chính.',
      };
    }
    if (status === 400 || rawMessage?.includes?.('400')) {
      return {
        status: 400,
        message: rawMessage || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
        fieldErrors: err?.errors || err?.fieldErrors || null,
      };
    }

    return {
      status: status || 500,
      message: 'Không thể tải dữ liệu. Vui lòng thử lại.',
    };
  };

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setInitialError(null);
    try {
      const response = await patientService.getPrimaryProfile();
      const data = response?.data || response;
      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.fullName || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || 'MALE',
          phone: data.phone || '',
        });
      } else {
        setInitialError({ message: 'Không tìm thấy hồ sơ chính.' });
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setInitialError(parsed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const executeFetch = async () => {
      try {
        const response = await patientService.getPrimaryProfile();
        if (ignore) return;
        const data = response?.data || response;
        if (data) {
          setProfile(data);
          setFormData({
            fullName: data.fullName || '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
            gender: data.gender || 'MALE',
            phone: data.phone || '',
          });
        } else {
          setInitialError({ message: 'Không tìm thấy hồ sơ chính.' });
        }
      } catch (err) {
        if (ignore) return;
        const parsed = parseApiError(err);
        setInitialError(parsed);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    executeFetch();

    return () => {
      ignore = true;
    };
  }, []);

  const handleStartEdit = () => {
    if (!profile) return;
    setFormData({
      fullName: profile.fullName || '',
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      gender: profile.gender || 'MALE',
      phone: profile.phone || '',
    });
    setValidationErrors({});
    setSaveError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender || 'MALE',
        phone: profile.phone || '',
      });
    }
    setValidationErrors({});
    setSaveError(null);
    setIsEditing(false);
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.fullName || !formData.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống.';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Ngày sinh không được để trống.';
    } else if (formData.dateOfBirth > today) {
      errors.dateOfBirth = 'Ngày sinh không được lớn hơn ngày hiện tại.';
    }

    if (!formData.gender) {
      errors.gender = 'Vui lòng chọn giới tính.';
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Số điện thoại không được để trống.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone.trim(),
    };

    setSaving(true);
    try {
      const response = await patientService.updatePrimaryProfile(payload);
      const updatedData = response?.data || response;

      // Update local profile state
      const mergedProfile = {
        ...profile,
        ...(updatedData && typeof updatedData === 'object' ? updatedData : payload),
        fullName: payload.fullName,
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        phone: payload.phone,
      };

      setProfile(mergedProfile);
      setIsEditing(false);
      setSuccessMessage('Cập nhật hồ sơ chính thành công!');

      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors && typeof parsed.fieldErrors === 'object') {
        setValidationErrors(parsed.fieldErrors);
      }
      setSaveError(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  // Max date allowed for date of birth is today
  const todayDateString = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast / Global Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto" />
            <div className="h-6 bg-slate-200 rounded-lg w-3/4 mx-auto" />
            <div className="h-4 bg-slate-200 rounded-lg w-1/2 mx-auto" />
          </div>
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-6">
            <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Initial Load Error */}
      {!loading && initialError && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Không thể tải thông tin hồ sơ</h3>
            <p className="text-sm text-slate-600">{initialError.message}</p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={loadProfileData}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Thử lại
            </button>
            {initialError.status === 401 && (
              <Link
                to="/auth/login"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Đăng nhập lại
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      {!loading && !initialError && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Summary Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white text-3xl font-bold flex items-center justify-center shadow-md mx-auto">
                {getAvatarInitial(profile.fullName)}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800 break-words">
                {profile.fullName || 'Chưa cập nhật tên'}
              </h2>
              <p className="text-sm text-slate-500">Chủ tài khoản</p>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60">
                <Shield className="w-3.5 h-3.5" /> Hồ sơ chính
              </span>
            </div>
          </div>

          {/* Right Column: Details & Edit Card */}
          <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h1 className="text-xl font-bold text-slate-800">Thông tin hồ sơ chính</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Thông tin này được sử dụng mặc định khi bạn đặt lịch khám.
                </p>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold rounded-xl transition cursor-pointer self-start sm:self-auto"
                >
                  <Edit3 className="w-4 h-4" /> Chỉnh sửa
                </button>
              ) : null}
            </div>

            {/* Error banner when saving fails */}
            {saveError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* VIEW MODE */}
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Họ và tên
                  </span>
                  <p className="text-sm font-semibold text-slate-800 break-words">
                    {profile.fullName || '—'}
                  </p>
                </div>

                {/* Date of Birth */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày sinh
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDateDisplay(profile.dateOfBirth) || '—'}
                  </p>
                </div>

                {/* Gender */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Giới tính
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {GENDER_MAP[profile.gender] || profile.gender || '—'}
                  </p>
                </div>

                {/* Phone */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {profile.phone || '—'}
                  </p>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={saving}
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (validationErrors.fullName) {
                          setValidationErrors({ ...validationErrors, fullName: null });
                        }
                      }}
                      placeholder="Nhập họ và tên"
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition ${
                        validationErrors.fullName
                          ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-indigo-500'
                      } disabled:opacity-60`}
                    />
                    {validationErrors.fullName && (
                      <p className="text-rose-600 text-xs mt-1 font-medium">{validationErrors.fullName}</p>
                    )}
                  </div>

                  {/* Date of Birth Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Ngày sinh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      max={todayDateString}
                      disabled={saving}
                      value={formData.dateOfBirth}
                      onChange={(e) => {
                        setFormData({ ...formData, dateOfBirth: e.target.value });
                        if (validationErrors.dateOfBirth) {
                          setValidationErrors({ ...validationErrors, dateOfBirth: null });
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition ${
                        validationErrors.dateOfBirth
                          ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-indigo-500'
                      } disabled:opacity-60`}
                    />
                    {validationErrors.dateOfBirth && (
                      <p className="text-rose-600 text-xs mt-1 font-medium">{validationErrors.dateOfBirth}</p>
                    )}
                  </div>

                  {/* Gender Select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Giới tính <span className="text-rose-500">*</span>
                    </label>
                    <select
                      disabled={saving}
                      value={formData.gender}
                      onChange={(e) => {
                        setFormData({ ...formData, gender: e.target.value });
                        if (validationErrors.gender) {
                          setValidationErrors({ ...validationErrors, gender: null });
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition ${
                        validationErrors.gender
                          ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-indigo-500'
                      } disabled:opacity-60`}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {validationErrors.gender && (
                      <p className="text-rose-600 text-xs mt-1 font-medium">{validationErrors.gender}</p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      disabled={saving}
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (validationErrors.phone) {
                          setValidationErrors({ ...validationErrors, phone: null });
                        }
                      }}
                      placeholder="Nhập số điện thoại"
                      className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition ${
                        validationErrors.phone
                          ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                          : 'border-slate-300 focus:ring-indigo-500'
                      } disabled:opacity-60`}
                    />
                    {validationErrors.phone && (
                      <p className="text-rose-600 text-xs mt-1 font-medium">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
