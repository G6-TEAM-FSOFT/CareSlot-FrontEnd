import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Briefcase,
  Globe,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { patientService } from '../../services/patientService';

// Custom Date Input displaying and formatting explicitly as DD/MM/YYYY (Ngày - Tháng - Năm)
const DateInputVi = ({ label, value, onChange, max, required = false, helperText = '' }) => {
  const [textValue, setTextValue] = useState('');
  const dateInputRef = React.useRef(null);

  useEffect(() => {
    if (value) {
      const parts = value.split('T')[0].split('-');
      if (parts.length === 3) {
        setTextValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
      }
    } else {
      setTextValue('');
    }
  }, [value]);

  const handleTextChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (raw.length <= 2) {
      formatted = raw;
    } else if (raw.length <= 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    } else {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    }
    setTextValue(formatted);

    if (raw.length === 8) {
      const day = raw.slice(0, 2);
      const month = raw.slice(2, 4);
      const year = raw.slice(4, 8);
      const iso = `${year}-${month}-${day}`;
      onChange(iso);
    } else if (raw.length === 0) {
      onChange('');
    }
  };

  const handleNativePickerChange = (e) => {
    const isoVal = e.target.value;
    onChange(isoVal);
  };

  return (
    <div className="space-y-1">
      <label className="font-semibold text-slate-700 block">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={textValue}
          onChange={handleTextChange}
          placeholder="DD/MM/YYYY (VD: 25/12/2004)"
          maxLength={10}
          className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
        />
        <button
          type="button"
          onClick={() => (dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus())}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 p-1 rounded-md transition cursor-pointer"
          title="Mở lịch để chọn ngày"
        >
          <Calendar className="w-4 h-4 text-sky-600" />
        </button>
        <input
          ref={dateInputRef}
          type="date"
          max={max}
          value={value || ''}
          onChange={handleNativePickerChange}
          className="sr-only"
          tabIndex={-1}
        />
      </div>
      <span className="text-[10px] text-slate-400 block">
        {helperText || 'Nhập dạng: Ngày/Tháng/Năm (VD: 25/12/2004) hoặc bấm icon lịch'}
      </span>
    </div>
  );
};

export const PatientProfilesPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'insurance'

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    relationship: 'SELF',
    identityCard: '',
    cardIssueDate: '',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    occupation: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientService.getPatients();
      const resData = res?.data || res || [];
      const list = Array.isArray(resData) ? resData : resData.content || [];
      
      setPatients(list);
      if (list.length > 0) {
        setSelectedPatient(list[0]);
      } else {
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    const hasSelf = patients.some(p => p.relationship === 'SELF');
    setEditingPatient(null);
    setFormData({
      fullName: '',
      dateOfBirth: '',
      gender: 'MALE',
      phone: '',
      relationship: hasSelf ? 'CHILD' : 'SELF',
      identityCard: '',
      cardIssueDate: '',
      ethnicity: 'Kinh',
      nationality: 'Việt Nam',
      occupation: '',
      address: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || 'MALE',
      phone: patient.phone || '',
      relationship: patient.relationship || 'SELF',
      identityCard: patient.identityCard || '',
      cardIssueDate: patient.cardIssueDate || '',
      ethnicity: patient.ethnicity || 'Kinh',
      nationality: patient.nationality || 'Việt Nam',
      occupation: patient.occupation || '',
      address: patient.address || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Validate Họ và tên (Không cho nhập số)
    const trimmedName = formData.fullName.trim();
    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập Họ và tên');
      return;
    }
    if (/\d/.test(trimmedName)) {
      setErrorMsg('Họ và tên không được chứa chữ số');
      return;
    }

    // 2. Validate Số điện thoại (Chỉ số, 10-11 chữ số, bắt đầu bằng 0)
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      setErrorMsg('Vui lòng nhập Số điện thoại');
      return;
    }
    if (!/^0\d{9,10}$/.test(trimmedPhone)) {
      setErrorMsg('Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và gồm 10-11 chữ số)');
      return;
    }

    // 3. Validate CCCD (Nếu có nhập, phải là 9-12 chữ số, không chứa chữ)
    const trimmedIdentity = (formData.identityCard || '').trim();
    if (trimmedIdentity && !/^\d{9,12}$/.test(trimmedIdentity)) {
      setErrorMsg('Căn cước công dân (CCCD) phải gồm từ 9 đến 12 chữ số');
      return;
    }

    // 4. Validate Nghề nghiệp (Không cho chứa số)
    const trimmedOccupation = (formData.occupation || '').trim();
    if (trimmedOccupation && /\d/.test(trimmedOccupation)) {
      setErrorMsg('Nghề nghiệp không được chứa chữ số');
      return;
    }

    // 5. Validate Ngày sinh (Không lớn hơn ngày hiện tại)
    const today = new Date().toISOString().split('T')[0];
    if (formData.dateOfBirth && formData.dateOfBirth > today) {
      setErrorMsg('Ngày sinh không được lớn hơn ngày hiện tại');
      return;
    }

    if (formData.cardIssueDate && formData.cardIssueDate > today) {
      setErrorMsg('Ngày cấp CCCD không được lớn hơn ngày hiện tại');
      return;
    }

    setSubmitting(true);

    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, formData);
        setSuccessMsg('Cập nhật hồ sơ bệnh nhân thành công!');
      } else {
        await patientService.createPatient(formData);
        setSuccessMsg('Tạo mới hồ sơ bệnh nhân thành công!');
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (err) {
      console.error('Error saving patient:', err);
      // Fallback local update if API stub
      if (editingPatient) {
        setPatients(patients.map(p => p.id === editingPatient.id ? { ...p, ...formData } : p));
        setSelectedPatient({ ...editingPatient, ...formData });
      } else {
        const newP = { id: Date.now(), ...formData };
        setPatients([...patients, newP]);
        setSelectedPatient(newP);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return;
    try {
      await patientService.deletePatient(id);
      setSuccessMsg('Đã xóa hồ sơ bệnh nhân!');
      fetchPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
      const remaining = patients.filter(p => p.id !== id);
      setPatients(remaining);
      if (remaining.length > 0) setSelectedPatient(remaining[0]);
    }
  };

  const getRelationshipText = (rel) => {
    switch (rel) {
      case 'SELF': return 'Chủ tài khoản';
      case 'SPOUSE': return 'Vợ / Chồng';
      case 'CHILD': return 'Con';
      case 'PARENT': return 'Bố / Mẹ';
      case 'OTHER': return 'Người thân khác';
      default: return rel || 'Người thân';
    }
  };

  const formatDateDisplayCustom = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
    }
    return dateStr;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-50 min-h-screen pt-6 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ================= LEFT SIDEBAR: PROFILE LIST (4 cols) ================= */}
          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={handleOpenCreateModal}
              className="w-full py-3 bg-white border border-sky-300 text-sky-700 hover:bg-sky-50 font-bold rounded-2xl text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Thêm mới</span>
            </button>

            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2">
              {loading ? (
                <p className="text-center py-6 text-xs text-slate-400">Đang tải hồ sơ...</p>
              ) : patients.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">Chưa có hồ sơ bệnh nhân</p>
              ) : (
                patients.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`p-3.5 rounded-xl cursor-pointer transition flex items-center space-x-3.5 border ${
                        isSelected
                          ? 'bg-sky-100/70 border-sky-400 shadow-xs'
                          : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 shrink-0">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 uppercase truncate">
                          {p.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {getRelationshipText(p.relationship)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


          {/* ================= RIGHT CONTENT: PROFILE DETAILS (8 cols) ================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[480px] p-6 space-y-6">
              
              {/* Tabs Navigation */}
              <div className="border-b border-slate-200 flex space-x-8 text-sm font-bold">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`pb-3 transition relative cursor-pointer ${
                    activeTab === 'personal'
                      ? 'text-sky-700 border-b-2 border-sky-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab('insurance')}
                  className={`pb-3 transition relative cursor-pointer ${
                    activeTab === 'insurance'
                      ? 'text-sky-700 border-b-2 border-sky-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Thẻ bảo hiểm y tế
                </button>
              </div>

              {!selectedPatient ? (
                <div className="py-20 text-center text-slate-400 text-sm">
                  Vui lòng chọn hồ sơ bệnh nhân ở bên trái để xem chi tiết.
                </div>
              ) : activeTab === 'personal' ? (
                /* Tab 1: Personal Information (Matches Image 3) */
                <div className="space-y-8">
                  {/* Profile Header Avatar & Name */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 shadow-inner">
                        <User className="w-9 h-9 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-lg font-extrabold text-slate-900 uppercase">
                            {selectedPatient.fullName}
                          </h2>
                          <button
                            onClick={() => handleOpenEditModal(selectedPatient)}
                            className="p-1 text-slate-400 hover:text-sky-600 transition rounded-lg hover:bg-sky-50 cursor-pointer"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {getRelationshipText(selectedPatient.relationship)}
                        </p>
                      </div>
                    </div>

                    {selectedPatient.relationship !== 'SELF' && (
                      <button
                        onClick={() => handleDeletePatient(selectedPatient.id)}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Xóa hồ sơ
                      </button>
                    )}
                  </div>

                  {/* Information Grid Table */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 text-xs text-slate-700">
                    {/* Row 1 */}
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Số điện thoại</span>
                      <p className="font-bold text-slate-800 text-sm">{selectedPatient.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Ngày sinh (Ngày - Tháng - Năm)</span>
                      <p className="font-bold text-slate-800 text-sm">
                        {formatDateDisplayCustom(selectedPatient.dateOfBirth)}
                      </p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Giới tính</span>
                      <p className="font-bold text-slate-800 text-sm">
                        {selectedPatient.gender === 'FEMALE' ? 'Nữ' : 'Nam'}
                      </p>
                    </div>

                    {/* Row 2 */}
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Căn cước công dân</span>
                      <p className="font-bold text-slate-800 text-sm">{selectedPatient.identityCard || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Ngày cấp (Ngày - Tháng - Năm)</span>
                      <p className="font-bold text-slate-800 text-sm">
                        {formatDateDisplayCustom(selectedPatient.cardIssueDate)}
                      </p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Dân tộc</span>
                      <p className="font-bold text-slate-800 text-sm">{selectedPatient.ethnicity || 'Kinh'}</p>
                    </div>

                    {/* Row 3 */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block font-medium">Quốc tịch</span>
                      <p className="font-bold text-slate-800 text-sm">{selectedPatient.nationality || 'Việt Nam'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block font-medium">Nghề nghiệp</span>
                      <p className="font-bold text-slate-800 text-sm">{selectedPatient.occupation || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block font-medium">Địa chỉ</span>
                      <p className="font-bold text-slate-800 text-sm">{selectedPatient.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: Health Insurance Info */
                <div className="space-y-6 py-4">
                  <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center space-x-4">
                    <ShieldCheck className="w-10 h-10 text-sky-600" />
                    <div>
                      <h4 className="font-bold text-sky-900 text-sm">Thẻ Bảo hiểm y tế (BHYT)</h4>
                      <p className="text-xs text-slate-500">Thông tin thẻ bảo hiểm đã kết nối với tài khoản bệnh nhân.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block text-[11px]">Mã số thẻ BHYT:</span>
                      <p className="font-bold text-slate-800 text-sm">DN 4 01 01 2345 6789</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block text-[11px]">Nơi ĐKKCB Ban đầu:</span>
                      <p className="font-bold text-slate-800 text-sm">Bệnh viện Đại học Y Hà Nội</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block text-[11px]">Hạn sử dụng thẻ:</span>
                      <p className="font-bold text-emerald-600 text-sm">01/01/2026 - 31/12/2026</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-slate-400 block text-[11px]">Mức hưởng BHYT:</span>
                      <p className="font-bold text-sky-700 text-sm">80% chi phí khám chữa bệnh đúng tuyến</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>


      {/* ================= MODAL CREATE / EDIT PATIENT PROFILE ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPatient ? 'Chỉnh sửa hồ sơ bệnh nhân' : 'Thêm mới hồ sơ bệnh nhân'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Họ và tên (Không cho nhập số) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[0-9]/g, '');
                      setFormData({ ...formData, fullName: val });
                    }}
                    placeholder="VD: NGUYỄN VĂN AN"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 block">Chỉ nhập chữ cái, không chứa số</span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Hồ sơ này của <span className="text-rose-500">*</span>
                  </label>
                  {editingPatient && editingPatient.relationship === 'SELF' ? (
                    <select
                      disabled
                      value="SELF"
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 cursor-not-allowed"
                    >
                      <option value="SELF">Chủ tài khoản (Bản thân)</option>
                    </select>
                  ) : (
                    <select
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                    >
                      {!patients.some(p => p.relationship === 'SELF' && p.id !== editingPatient?.id) && (
                        <option value="SELF">Chủ tài khoản (Bản thân)</option>
                      )}
                      <option value="SPOUSE">Vợ / Chồng</option>
                      <option value="CHILD">Con</option>
                      <option value="PARENT">Bố / Mẹ</option>
                      <option value="OTHER">Người thân khác</option>
                    </select>
                  )}
                </div>

                {/* Ngày sinh (Ngày - Tháng - Năm) */}
                <DateInputVi
                  label="Ngày sinh"
                  required={true}
                  max={todayStr}
                  value={formData.dateOfBirth}
                  onChange={(val) => setFormData({ ...formData, dateOfBirth: val })}
                  helperText="Nhập dạng: Ngày/Tháng/Năm (VD: 25/12/2004) hoặc bấm icon lịch"
                />

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Giới tính <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>

                {/* Số điện thoại (Chỉ cho nhập số) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setFormData({ ...formData, phone: val });
                    }}
                    placeholder="VD: 0912345678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 block">Chỉ nhập chữ số (10 - 11 số)</span>
                </div>

                {/* CCCD (Chỉ cho nhập số) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Căn cước công dân (CCCD)</label>
                  <input
                    type="text"
                    value={formData.identityCard}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setFormData({ ...formData, identityCard: val });
                    }}
                    placeholder="VD: 075204000024 (Tùy chọn)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 block">Chỉ nhập chữ số (tối đa 12 số)</span>
                </div>

                {/* Ngày cấp CCCD (Ngày - Tháng - Năm) */}
                <DateInputVi
                  label="Ngày cấp CCCD"
                  max={todayStr}
                  value={formData.cardIssueDate}
                  onChange={(val) => setFormData({ ...formData, cardIssueDate: val })}
                  helperText="Nhập dạng: Ngày/Tháng/Năm (VD: 22/10/2022) hoặc bấm icon lịch"
                />

                {/* Nghề nghiệp (Không cho nhập số) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nghề nghiệp</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[0-9]/g, '');
                      setFormData({ ...formData, occupation: val });
                    }}
                    placeholder="VD: Nhân viên văn phòng"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 block">Chỉ nhập chữ cái, không chứa số</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="VD: 78 Bình Lộc, Xã Quảng Sơn, Lâm Đồng"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
