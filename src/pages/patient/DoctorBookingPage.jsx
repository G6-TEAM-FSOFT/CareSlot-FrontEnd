import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Building,
  Stethoscope,
  DollarSign,
  FileText,
  UserCheck,
  Phone,
  Plus,
  CheckCircle2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { clinicService, doctorService, slotService, appointmentService, specialtyService } from '../../services/clinicService';
import { patientService } from '../../services/patientService';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { useNavigate } from 'react-router-dom';

export const DoctorBookingPage = () => {
  const navigate = useNavigate();

  // Filters state
  const [bookingMode, setBookingMode] = useState('doctor'); // 'doctor' | 'specialty'
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useInsurance, setUseInsurance] = useState('no');
  const [searchTerm, setSearchTerm] = useState('');

  // Data lists
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Selected Doctor and Slot state
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptomNote, setSymptomNote] = useState('');

  // Booking state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);

  // Initial Load: Patients, Clinics, Specialties, Doctors
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Patients
      const patientRes = await patientService.getPatients();
      const patientData = patientRes?.data || patientRes || [];
      const patientList = Array.isArray(patientData) ? patientData : patientData.content || [];
      setPatients(patientList);
      if (patientList.length > 0) {
        setSelectedPatientId(patientList[0].id);
      }

      // 2. Fetch Clinics
      const clinicRes = await clinicService.getAllClinics();
      const clinicData = clinicRes?.data || clinicRes || [];
      setClinics(Array.isArray(clinicData) ? clinicData : clinicData.content || []);

      // 3. Fetch Specialties
      const specRes = await specialtyService.getAllSpecialties();
      const specData = specRes?.data || specRes || [];
      setSpecialties(Array.isArray(specData) ? specData : specData.content || []);

    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  };

  // Fetch Doctors whenever filters change
  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, selectedClinicId, selectedSpecialtyId, bookingMode]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const params = {};
      if (searchTerm) params.keyword = searchTerm;
      if (selectedClinicId) params.clinicId = selectedClinicId;
      if (selectedSpecialtyId) params.specialtyId = selectedSpecialtyId;

      const res = await doctorService.getAllDoctors(params);
      const resData = res?.data || res || [];
      const doctorList = Array.isArray(resData) ? resData : resData.content || [];
      setDoctors(doctorList);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Toggle Expand Doctor Schedule
  const handleToggleDoctor = async (doctor) => {
    if (expandedDoctorId === doctor.id) {
      setExpandedDoctorId(null);
      setDoctorSlots([]);
      return;
    }

    setExpandedDoctorId(doctor.id);
    setLoadingSlots(true);
    setSelectedSlot(null);

    // Generate date pills (today + next 4 days)
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short' });
      const dayMonth = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      dates.push({ dateStr, label: `${dayName} ${dayMonth}` });
    }
    setAvailableDates(dates);
    setSelectedSlotDate(dates[0].dateStr);

    fetchDoctorSlots(doctor.id, dates[0].dateStr);
  };

  const fetchDoctorSlots = async (doctorId, dateStr) => {
    setLoadingSlots(true);
    try {
      const res = await slotService.getDoctorSlots(doctorId, { date: dateStr, status: 'AVAILABLE' });
      const resData = res?.data || res || [];
      setDoctorSlots(Array.isArray(resData) ? resData : []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setDoctorSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (dateStr) => {
    setSelectedSlotDate(dateStr);
    if (expandedDoctorId) {
      fetchDoctorSlots(expandedDoctorId, dateStr);
    }
  };

  // Submit Booking
  const handleBookAppointment = async () => {
    if (!selectedPatientId) {
      setBookingError('Vui lòng chọn người tới khám');
      return;
    }
    if (!selectedSlot) {
      setBookingError('Vui lòng chọn ca khám');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');
    setBookingSuccess(null);

    try {
      const bookingData = {
        patientProfileId: Number(selectedPatientId),
        slotId: selectedSlot.id,
        symptomNote: symptomNote || 'Đặt khám qua website CareSlot',
        depositAmount: 100000.00
      };

      const res = await appointmentService.createAppointment(bookingData);
      const createdData = res?.data || res;
      setBookingSuccess(createdData);
      setPaymentAppointment(createdData);
      setShowPaymentModal(true);

      // Reset selection
      setSelectedSlot(null);
      setExpandedDoctorId(null);
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err.message || 'Đặt khám thất bại. Ca khám có thể đã được chọn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDoctor = doctors.find((d) => d.id === expandedDoctorId);
  const activePatient = patients.find((p) => String(p.id) === String(selectedPatientId));

  return (
    <div className="bg-slate-50 min-h-screen pt-6 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ================= COLUMN 1: FILTER PANEL (3 cols) ================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 text-sky-900 font-bold border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>Thông tin đặt khám</span>
              </div>

              {/* Phương thức đặt khám toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Phương thức đặt khám</label>
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBookingMode('doctor')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${bookingMode === 'doctor'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Bác sĩ
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode('specialty')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${bookingMode === 'specialty'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Chuyên khoa
                  </button>
                </div>
              </div>

              {/* Người tới khám (*) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Người tới khám (*)</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {patients.length === 0 ? (
                    <option value="">Chưa có hồ sơ bệnh nhân</option>
                  ) : (
                    patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.relationship || 'Hồ sơ'})
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={() => navigate('/patients')}
                  className="text-xs text-sky-600 hover:underline flex items-center gap-1 font-medium pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Quản lý / Thêm hồ sơ
                </button>
              </div>

              {/* Chọn cơ sở khám */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Chọn cơ sở khám</label>
                <select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Tất cả các cơ sở</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nếu chọn theo Chuyên khoa */}
              {bookingMode === 'specialty' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Chọn chuyên khoa</label>
                  <select
                    value={selectedSpecialtyId}
                    onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Chọn ngày khám (Range) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Chọn ngày khám</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Sử dụng Bảo hiểm y tế */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-600 block">Sử dụng Bảo hiểm y tế *</label>
                <div className="flex items-center space-x-6 text-sm text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="insurance"
                      value="yes"
                      checked={useInsurance === 'yes'}
                      onChange={() => setUseInsurance('yes')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Có</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="insurance"
                      value="no"
                      checked={useInsurance === 'no'}
                      onChange={() => setUseInsurance('no')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>Không</span>
                  </label>
                </div>
              </div>
            </div>
          </div>


          {/* ================= COLUMN 2: DOCTOR LIST & SLOTS (6 cols) ================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên bác sĩ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>
              <div className="px-3.5 py-2.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                <UserCheck className="w-4 h-4" />
                <span>Tìm thấy {doctors.length} bác sĩ phù hợp</span>
              </div>
            </div>

            {/* Notification alert if booking success */}
            {bookingSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Tạo đơn đặt khám thành công! Mã booking: {bookingSuccess.bookingCode || 'CS-SUCCESS'}</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Lịch khám của bạn đang được tạm giữ trong 10 phút. Vui lòng thanh toán tiền cọc 100.000 đ để hoàn tất xác nhận.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAppointment(bookingSuccess);
                      setShowPaymentModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Thanh toán cọc ngay qua VNPay &rarr;</span>
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-xs text-emerald-800 underline font-semibold"
                  >
                    Xem lịch khám
                  </button>
                </div>
              </div>
            )}

            {/* Doctors List */}
            {loadingDoctors ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Đang tải danh sách bác sĩ...
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Không tìm thấy bác sĩ phù hợp với tiêu chí lọc.
              </div>
            ) : (
              <div className="space-y-4">
                {doctors.map((doctor) => {
                  const isExpanded = expandedDoctorId === doctor.id;

                  return (
                    <div
                      key={doctor.id}
                      className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden ${isExpanded ? 'border-sky-500 ring-1 ring-sky-500' : 'border-slate-200 hover:border-sky-300'
                        }`}
                    >
                      {/* Doctor Header Info */}
                      <div className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                            <Stethoscope className="w-7 h-7 text-sky-600" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-800">
                              {doctor.title ? `${doctor.title} ` : ''}{doctor.fullName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              Chuyên khoa: <span className="text-slate-700">{doctor.specialtyName || doctor.specialty?.name || 'Tai mũi họng'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 block font-medium">Giá khám:</span>
                            <span className="text-sm font-extrabold text-amber-600">
                              {doctor.consultationFee ? Number(doctor.consultationFee).toLocaleString() : '350.000'} đ
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleDoctor(doctor)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${isExpanded
                                ? 'bg-slate-700 hover:bg-slate-800 text-white'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'
                              }`}
                          >
                            {isExpanded ? 'Ẩn lịch' : 'Chọn'}
                          </button>
                        </div>
                      </div>

                      {/* ================= EXPANDED SCHEDULE SECTION (Hình 2) ================= */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 p-5 bg-sky-50/40 space-y-4">
                          {/* Date Selector Pills */}
                          <div>
                            <span className="text-xs font-bold text-slate-700 block mb-2">Chọn ngày khám:</span>
                            <div className="flex flex-wrap gap-2">
                              {availableDates.map((d) => (
                                <button
                                  key={d.dateStr}
                                  type="button"
                                  onClick={() => handleDateChange(d.dateStr)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${selectedSlotDate === d.dateStr
                                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                  {d.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Clinic Info Box */}
                          <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-xs space-y-2 text-xs text-slate-600">
                            <h4 className="font-bold text-sky-900 text-xs flex items-center gap-1.5">
                              <Building className="w-4 h-4 text-sky-600" />
                              {doctor.clinicName || doctor.clinic?.name || 'Phòng khám đa khoa - Cơ sở Cầu Giấy'}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[12px]">
                              <p className="flex items-center gap-1.5 text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span>Địa chỉ: {doctor.clinicAddress || doctor.clinic?.address || 'Số 10, Trương Công Giai, Cầu Giấy, Hà Nội'}</span>
                              </p>
                              <p className="flex items-center gap-1.5 text-slate-600">
                                <Building className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span>Phòng: TCG.P404 - Nội soi TMH</span>
                              </p>
                              <p className="flex items-center gap-1.5 text-slate-600">
                                <Stethoscope className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span>Dịch vụ: Khám Tai mũi họng [PKĐK CG]</span>
                              </p>
                              <p className="flex items-center gap-1.5 text-amber-600 font-bold">
                                <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>Giá khám: {doctor.consultationFee ? Number(doctor.consultationFee).toLocaleString() : '350.000'} đ</span>
                              </p>
                            </div>
                            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                              Ghi chú: {useInsurance === 'yes' ? 'Hỗ trợ thanh toán BHYT đúng tuyến' : 'không nhận khám BHYT'}
                            </p>
                          </div>

                          {/* Time Slots */}
                          <div>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-2">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Ca khám khả dụng ({selectedSlotDate})</span>
                            </div>

                            {loadingSlots ? (
                              <p className="text-xs text-slate-500 italic">Đang tải lịch trống...</p>
                            ) : doctorSlots.length === 0 ? (
                              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                                Không có ca khám trống trong ngày này. Vui lòng chọn ngày khác.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {doctorSlots.map((slot) => {
                                  const isSelected = selectedSlot?.id === slot.id;
                                  const timeDisplay = `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;

                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot)}
                                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${isSelected
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700'
                                        }`}
                                    >
                                      {timeDisplay}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* ================= COLUMN 3: BOOKING SUMMARY PANEL (3 cols) ================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 sticky top-20">
              <h3 className="text-sky-900 font-bold border-b border-slate-100 pb-3 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                Tóm tắt lịch khám
              </h3>

              {!selectedSlot || !activeDoctor ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                    Vui lòng chọn bác sĩ và giờ khám để xem chi tiết.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-700">
                  {/* Selected Patient */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Bệnh nhân khám:</span>
                    <p className="font-bold text-slate-800">{activePatient ? activePatient.fullName : 'Chưa chọn'}</p>
                    <p className="text-[11px] text-slate-500">SĐT: {activePatient?.phone || 'Chưa cập nhật'}</p>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1">
                    <span className="text-[11px] text-sky-600 block font-medium">Bác sĩ phụ trách:</span>
                    <p className="font-bold text-sky-900">{activeDoctor.title} {activeDoctor.fullName}</p>
                    <p className="text-[11px] text-slate-600">{activeDoctor.specialtyName || 'Chuyên khoa'}</p>
                  </div>

                  {/* Slot Details */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1">
                    <span className="text-[11px] text-amber-700 block font-medium">Thời gian khám:</span>
                    <p className="font-bold text-amber-900 text-sm">
                      {selectedSlot.startTime.substring(0, 5)} - {selectedSlot.endTime.substring(0, 5)}
                    </p>
                    <p className="text-[11px] text-amber-800">Ngày: {selectedSlot.appointmentDate || selectedSlotDate}</p>
                    <p className="text-[11px] text-amber-800">Phòng: {selectedSlot.roomName || 'Tầng 3 - Phòng 404'}</p>
                  </div>

                  {/* Symptom Note */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Ghi chú triệu chứng:</label>
                    <textarea
                      rows={2}
                      value={symptomNote}
                      onChange={(e) => setSymptomNote(e.target.value)}
                      placeholder="Mô tả ngắn gọn lý do/triệu chứng khám..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Fee Summary */}
                  <div className="border-t border-slate-100 pt-3 space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Giá khám:</span>
                      <span>{Number(activeDoctor.consultationFee || 350000).toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>Tạm ứng / Đặt cọc:</span>
                      <span className="text-sky-600">100.000 đ</span>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleBookAppointment}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Đang xử lý đặt lịch...' : 'Xác nhận Đặt khám'}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        appointment={paymentAppointment}
      />
    </div>
  );
};
