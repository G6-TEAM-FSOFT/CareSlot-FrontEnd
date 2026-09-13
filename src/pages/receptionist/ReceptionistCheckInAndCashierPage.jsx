import React, { useState, useEffect } from 'react';
import { outpatientService } from '../../services/outpatientService';
import { patientService } from '../../services/patientService';
import { 
  Shield, CheckCircle2, RefreshCw, Sparkles 
} from 'lucide-react';

import PatientProfileModal from '../../components/receptionist/PatientProfileModal';
import AppointmentQueueList from '../../components/receptionist/AppointmentQueueList';
import CashierInvoicePanel from '../../components/receptionist/CashierInvoicePanel';

export default function ReceptionistCheckInAndCashierPage() {
  const [listTab, setListTab] = useState('CONFIRMED'); // 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED'
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualAptId, setManualAptId] = useState('');
  const [activeVisit, setActiveVisit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingApts, setFetchingApts] = useState(false);
  const [message, setMessage] = useState(null);

  // Patient Profile View/Edit Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedAptForModal, setSelectedAptForModal] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    identityCard: '',
    cardIssueDate: '',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    occupation: '',
    address: '',
    relationship: 'Bản thân'
  });

  useEffect(() => {
    fetchAppointments(listTab);
    restoreActiveVisit();
  }, [listTab]);

  const restoreActiveVisit = async () => {
    const savedVisitId = localStorage.getItem('receptionist_active_visit_id');
    if (savedVisitId) {
      try {
        const res = await outpatientService.getVisitDetail(savedVisitId);
        if (res && res.data) {
          setActiveVisit(res.data);
        }
      } catch (e) {
        console.error('Không thể khôi phục active visit:', e);
        localStorage.removeItem('receptionist_active_visit_id');
      }
    }
  };

  const fetchAppointments = async (tabStatus) => {
    setFetchingApts(true);
    try {
      const res = await outpatientService.getConfirmedAppointments(tabStatus);
      if (res && res.data) {
        const items = res.data.content ? res.data.content : (Array.isArray(res.data) ? res.data : []);
        setAppointments(items);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách lịch hẹn:', err);
    } finally {
      setFetchingApts(false);
    }
  };

  const openPatientModal = async (apt) => {
    setSelectedAptForModal(apt);
    const p = apt.patientProfile || {};
    
    const initialForm = {
      fullName: p.fullName || apt.patientName || '',
      phone: p.phone || apt.patientPhone || '',
      dateOfBirth: p.dateOfBirth || p.dob || apt.patientDob || '1995-06-15',
      gender: p.gender || apt.patientGender || 'MALE',
      identityCard: p.identityCard || p.cccd || '',
      cardIssueDate: p.cardIssueDate || '',
      ethnicity: p.ethnicity || 'Kinh',
      nationality: p.nationality || 'Việt Nam',
      occupation: p.occupation || 'Tự do',
      address: p.address || 'Hà Nội',
      relationship: p.relationship || 'Bản thân'
    };
    
    setPatientForm(initialForm);
    setShowPatientModal(true);

    const profileId = apt.patientProfileId || p.id;
    if (profileId) {
      try {
        const res = await patientService.getPatientById(profileId);
        if (res && res.data) {
          const detail = res.data;
          setPatientForm(prev => ({
            ...prev,
            fullName: detail.fullName || prev.fullName,
            phone: detail.phone || prev.phone,
            dateOfBirth: detail.dateOfBirth || prev.dateOfBirth,
            gender: detail.gender || prev.gender,
            identityCard: detail.identityCard || prev.identityCard,
            cardIssueDate: detail.cardIssueDate || prev.cardIssueDate,
            ethnicity: detail.ethnicity || prev.ethnicity,
            nationality: detail.nationality || prev.nationality,
            occupation: detail.occupation || prev.occupation,
            address: detail.address || prev.address,
            relationship: detail.relationship || prev.relationship
          }));
        }
      } catch (err) {
        console.warn('Không thể nạp chi tiết profile:', err);
      }
    }
  };

  const handleSavePatientProfileOnly = async (e) => {
    if (e) e.preventDefault();
    if (!selectedAptForModal) return;

    setSavingProfile(true);
    setMessage(null);
    const profileId = selectedAptForModal.patientProfileId || selectedAptForModal.patientProfile?.id || selectedAptForModal.id;
    try {
      await patientService.updatePatient(profileId, patientForm);

      setAppointments(prev => prev.map(a => {
        if (a.id === selectedAptForModal.id) {
          return {
            ...a,
            patientName: patientForm.fullName,
            patientPhone: patientForm.phone,
            patientProfile: {
              ...(a.patientProfile || {}),
              ...patientForm
            }
          };
        }
        return a;
      }));

      if (activeVisit && (activeVisit.appointmentId === selectedAptForModal.id || activeVisit.patientName === selectedAptForModal.patientName)) {
        setActiveVisit(prev => ({
          ...prev,
          patientName: patientForm.fullName,
          patientPhone: patientForm.phone
        }));
      }

      setMessage({ type: 'success', text: `Đã cập nhật thông tin hồ sơ cho bệnh nhân "${patientForm.fullName}"!` });
      setShowPatientModal(false);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi cập nhật hồ sơ: ' + (err.message || 'Không thể lưu') });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfileAndCheckIn = async (e, reassignmentData = {}) => {
    if (e) e.preventDefault();
    if (!selectedAptForModal) return;

    setSavingProfile(true);
    setMessage(null);
    const profileId = selectedAptForModal.patientProfileId || selectedAptForModal.patientProfile?.id || selectedAptForModal.id;
    try {
      await patientService.updatePatient(profileId, patientForm);

      const checkInPayload = {
        appointmentId: selectedAptForModal.id,
        ...(reassignmentData.replacementSlotId ? {
          replacementSlotId: reassignmentData.replacementSlotId,
          reason: reassignmentData.reason
        } : {})
      };

      const res = await outpatientService.checkIn(checkInPayload);
      if (res && res.data) {
        setActiveVisit(res.data);
        localStorage.setItem('receptionist_active_visit_id', res.data.id);
        const reassignText = reassignmentData.replacementSlotId
          ? ` (Đã điều chuyển sang Bác sĩ: ${res.data.primaryDoctorName || 'mới'})`
          : '';
        setMessage({
          type: 'success',
          text: `Cập nhật hồ sơ & Check-in thành công!${reassignText} Khởi tạo Đợt khám Mã: ${res.data.visitCode} cho bệnh nhân ${patientForm.fullName}`
        });
        fetchAppointments(listTab);
        setShowPatientModal(false);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi Check-in: ' + (err.message || err.response?.data?.message || 'Không thể check-in') });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSelectVisitByAppointmentId = async (aptId) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await outpatientService.getVisitByAppointmentId(aptId);
      if (res && res.data) {
        setActiveVisit(res.data);
        localStorage.setItem('receptionist_active_visit_id', res.data.id);
        setMessage({ type: 'success', text: `Đã nạp Đợt khám Mã: ${res.data.visitCode} (${res.data.patientName})` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Chưa khởi tạo Đợt khám (Visit) cho lịch hẹn này.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (aptId) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await outpatientService.checkIn(aptId);
      if (res && res.data) {
        setActiveVisit(res.data);
        localStorage.setItem('receptionist_active_visit_id', res.data.id);
        setMessage({ type: 'success', text: `Check-in thành công! Đã khởi tạo Đợt khám Mã: ${res.data.visitCode}` });
        fetchAppointments(listTab);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi Check-in: ' + (err.message || err.response?.data?.message || 'Không thể check-in') });
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await outpatientService.payInvoice(invoiceId);
      if (res && res.data) {
        setActiveVisit(res.data);
        setMessage({ type: 'success', text: `Đã thu tiền Hóa đơn #${invoiceId}. Trạng thái các task Cận lâm sàng đã chuyển sang READY!` });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi thu tiền hóa đơn: ' + (err.message || err.response?.data?.message || 'Không thể thanh toán') });
    } finally {
      setLoading(false);
    }
  };

  const handleClearActiveVisit = () => {
    setActiveVisit(null);
    localStorage.removeItem('receptionist_active_visit_id');
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (apt.bookingCode && apt.bookingCode.toLowerCase().includes(q)) ||
      (apt.patientProfile?.fullName && apt.patientProfile.fullName.toLowerCase().includes(q)) ||
      (apt.patientProfile?.phone && apt.patientProfile.phone.includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner / Title Header */}
        <div className="bg-gradient-to-r from-cyan-700 via-teal-600 to-cyan-800 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <div className="text-xs font-bold text-cyan-100 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quầy Tiếp Nhận & Thu Ngân Nhanh
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-200" />
                Lễ Tân & Thu Ngân (Receptionist & Cashier Portal)
              </h1>
              <p className="text-xs md:text-sm text-cyan-100 mt-1 max-w-2xl">
                Tiếp nhận bệnh nhân đã đặt lịch hẹn, cấp đợt khám (Visit), theo dõi tiến trình khám bệnh realtime và thu tiền các hóa đơn cận lâm sàng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchAppointments(listTab)}
                disabled={fetchingApts}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 text-cyan-200 ${fetchingApts ? 'animate-spin' : ''}`} />
                Làm mới danh sách
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {message && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium transition-all ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Appointment Queue List Component */}
          <AppointmentQueueList
            listTab={listTab}
            setListTab={setListTab}
            filteredAppointments={filteredAppointments}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            manualAptId={manualAptId}
            setManualAptId={setManualAptId}
            fetchingApts={fetchingApts}
            loading={loading}
            onOpenPatientModal={openPatientModal}
            onCheckIn={handleCheckIn}
            onSelectVisitByAppointmentId={handleSelectVisitByAppointmentId}
          />

          {/* Cashier Invoice Panel Component */}
          <CashierInvoicePanel
            activeVisit={activeVisit}
            loading={loading}
            onOpenPatientModal={openPatientModal}
            onClearActiveVisit={handleClearActiveVisit}
            onPayInvoice={handlePayInvoice}
          />

        </div>

      </div>

      {/* Patient Profile View/Edit Modal Component */}
      <PatientProfileModal
        show={showPatientModal}
        selectedApt={selectedAptForModal}
        listTab={listTab}
        patientForm={patientForm}
        setPatientForm={setPatientForm}
        savingProfile={savingProfile}
        loading={loading}
        onClose={() => setShowPatientModal(false)}
        onSaveProfileOnly={handleSavePatientProfileOnly}
        onSaveProfileAndCheckIn={handleSaveProfileAndCheckIn}
      />
    </div>
  );
}
