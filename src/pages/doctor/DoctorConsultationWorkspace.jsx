import React, { useState, useEffect } from 'react';
import { outpatientService } from '../../services/outpatientService';
import { patientService } from '../../services/patientService';
import { 
  Stethoscope, CheckCircle2, RefreshCw, Sparkles, PlayCircle 
} from 'lucide-react';

import DoctorQueueList from '../../components/doctor/DoctorQueueList';
import ActivePatientBanner from '../../components/doctor/ActivePatientBanner';
import CompletedVisitSummaryCard from '../../components/doctor/CompletedVisitSummaryCard';
import VitalSignsAndNoteForm from '../../components/doctor/VitalSignsAndNoteForm';
import ClinicalOrderRoundsForm from '../../components/doctor/ClinicalOrderRoundsForm';
import RealtimeDiagnosticResultsList from '../../components/doctor/RealtimeDiagnosticResultsList';
import PrescriptionAndFinalizeForm from '../../components/doctor/PrescriptionAndFinalizeForm';
import DoctorPatientProfileModal from '../../components/doctor/DoctorPatientProfileModal';
import DoctorMedicalHistoryModal from '../../components/doctor/DoctorMedicalHistoryModal';

export default function DoctorConsultationWorkspace() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(1); // Room 305
  const [queueTab, setQueueTab] = useState('ALL'); // 'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'
  const [queue, setQueue] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState(null);

  const [visit, setVisit] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingQueue, setFetchingQueue] = useState(false);
  const [message, setMessage] = useState(null);

  // Patient Details & Medical History Modal states
  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [patientProfileDetail, setPatientProfileDetail] = useState(null);
  const [patientHistoryList, setPatientHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Vital signs form state (Assistant / Doctor joint input)
  const [systolicBp, setSystolicBp] = useState('120');
  const [diastolicBp, setDiastolicBp] = useState('80');
  const [heartRateBpm, setHeartRateBpm] = useState('78');
  const [temperatureC, setTemperatureC] = useState('36.8');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('65');
  const [spo2, setSpo2] = useState('98');
  const [formDataText, setFormDataText] = useState('Bệnh nhân đau vùng thượng vị 5 ngày nay, đau âm ỉ sau ăn, không sốt, không nôn, tiền sử dạ dày 2 năm.');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [showRound2Form, setShowRound2Form] = useState(false);

  // Prescription items state
  const [prescriptionItems, setPrescriptionItems] = useState([
    { drugName: 'No-Spa 40mg', dosage: '40mg', usageInstruction: 'Uống 1 viên x 2 lần/ngày sau ăn', quantity: 10, unit: 'Viên', unitPrice: 3500 },
    { drugName: 'Phosphalugel 20g', dosage: '20g', usageInstruction: 'Uống 1 gói khi đau rát bụng', quantity: 15, unit: 'Gói', unitPrice: 4500 }
  ]);
  const [diagnosisNote, setDiagnosisNote] = useState('Viêm dạ dày - tá tràng cấp tính (K29.1)');

  // Disposition state
  const [dispositionType, setDispositionType] = useState('OUTPATIENT');
  const [dispositionNotes, setDispositionNotes] = useState('Bệnh nhân điều trị ngoại trú theo đơn thuốc, kiêng đồ cay nóng, tái khám sau 7 ngày.');

  const openPatientProfileModal = async () => {
    const profileId = visit?.patientProfileId || selectedEncounter?.patientProfileId;
    const initialObj = {
      fullName: visit?.patientName || selectedEncounter?.patientName || 'Bệnh nhân',
      phone: visit?.patientPhone || selectedEncounter?.patientPhone || '',
      dateOfBirth: visit?.patientDob || selectedEncounter?.patientDob || '1995-06-15',
      gender: visit?.patientGender || selectedEncounter?.patientGender || 'MALE',
      identityCard: '001095012345',
      cardIssueDate: '2021-05-10',
      ethnicity: 'Kinh',
      nationality: 'Việt Nam',
      occupation: 'Kỹ sư CNTT',
      address: 'Phố Chùa Bộc, Đống Đa, Hà Nội',
      relationship: 'Bản thân'
    };
    setPatientProfileDetail(initialObj);
    setShowPatientProfileModal(true);

    if (profileId) {
      try {
        const res = await patientService.getPatientById(profileId);
        if (res && res.data) {
          setPatientProfileDetail(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.warn('Không thể nạp chi tiết profile:', err);
      }
    }
  };

  const openMedicalHistoryModal = async () => {
    const profileId = visit?.patientProfileId || selectedEncounter?.patientProfileId || 1;
    setLoadingHistory(true);
    setShowMedicalHistoryModal(true);
    try {
      const res = await outpatientService.getPatientHistory(profileId);
      if (res && res.data) {
        setPatientHistoryList(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.warn('Lỗi nạp lịch sử khám bệnh:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isVitalAndHistorySaved = Boolean(
    visit &&
    visit.vitalSigns && visit.vitalSigns.length > 0 &&
    visit.clinicalNotes && visit.clinicalNotes.length > 0
  );

  useEffect(() => {
    fetchRoomsAndCatalog();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomQueue(queueTab);
    }
  }, [selectedRoomId, queueTab]);

  useEffect(() => {
    if (selectedEncounter && selectedEncounter.visitId) {
      fetchVisitDetail(selectedEncounter.visitId);
    }
  }, [selectedEncounter]);

  const fetchRoomsAndCatalog = async () => {
    try {
      const [roomsRes, catalogRes] = await Promise.all([
        outpatientService.getRooms(1),
        outpatientService.getCatalog(1)
      ]);

      if (roomsRes) {
        const roomList = Array.isArray(roomsRes.data) ? roomsRes.data : (Array.isArray(roomsRes) ? roomsRes : []);
        if (roomList.length > 0) setRooms(roomList);
      }

      let catList = [];
      if (catalogRes) {
        if (Array.isArray(catalogRes.data)) catList = catalogRes.data;
        else if (Array.isArray(catalogRes)) catList = catalogRes;
      }

      setCatalog(catList);
      if (catList.length > 0) {
        setSelectedServiceIds(catList.slice(0, 2).map(s => s.id));
      }
    } catch (err) {
      console.error('Lỗi nạp phòng và danh mục từ Real API:', err);
    }
  };

  const fetchRoomQueue = async (tab = 'ALL') => {
    setFetchingQueue(true);
    try {
      const res = await outpatientService.getEncounterQueueByRoom(selectedRoomId, tab);
      if (res) {
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setQueue(list);
        if (list.length > 0 && (!selectedEncounter || !list.some(e => e.id === selectedEncounter.id))) {
          setSelectedEncounter(list[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi lấy hàng chờ bác sĩ:', err);
    } finally {
      setFetchingQueue(false);
    }
  };

  const fetchVisitDetail = async (vId) => {
    setLoading(true);
    try {
      const res = await outpatientService.getVisitDetail(vId);
      if (res && res.data) {
        const vData = res.data;
        setVisit(vData);

        if (vData.vitalSigns && vData.vitalSigns.length > 0) {
          const v = vData.vitalSigns[0];
          if (v.systolicBp != null) setSystolicBp(v.systolicBp.toString());
          if (v.diastolicBp != null) setDiastolicBp(v.diastolicBp.toString());
          if (v.heartRateBpm != null) setHeartRateBpm(v.heartRateBpm.toString());
          if (v.temperatureC != null) setTemperatureC(v.temperatureC.toString());
          if (v.heightCm != null) setHeightCm(v.heightCm.toString());
          if (v.weightKg != null) setWeightKg(v.weightKg.toString());
          if (v.spo2 != null) setSpo2(v.spo2.toString());
        }

        if (vData.clinicalNotes && vData.clinicalNotes.length > 0) {
          const noteObj = vData.clinicalNotes[0];
          if (noteObj && noteObj.formData) {
            try {
              const parsed = JSON.parse(noteObj.formData);
              setFormDataText(parsed.note != null ? parsed.note : noteObj.formData);
            } catch {
              setFormDataText(noteObj.formData);
            }
          }
        }
      }
    } catch (err) {
      console.error('Lỗi nạp chi tiết đợt khám:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEncounter = async (encToStart) => {
    const targetEnc = encToStart || selectedEncounter;
    if (!targetEnc) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await outpatientService.startEncounter(targetEnc.id);
      if (res && res.data) {
        setVisit(res.data);
        setSelectedEncounter(prev => prev && prev.id === targetEnc.id ? { ...prev, status: 'IN_PROGRESS' } : { ...targetEnc, status: 'IN_PROGRESS' });
        setMessage({ type: 'success', text: `Đã bắt đầu khám cho bệnh nhân ${targetEnc.patientName || 'bệnh nhân'}! Trạng thái Encounter chuyển sang IN_PROGRESS.` });
        fetchRoomQueue(queueTab);
      }
    } catch (err) {
      console.error('Lỗi khi bắt đầu khám:', err);
      setMessage({ type: 'error', text: 'Lỗi khi bắt đầu khám: ' + (err.message || err.response?.data?.message || 'Không thể cập nhật trạng thái') });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVitalAndNote = async (e) => {
    if (e) e.preventDefault();
    if (!visit || !selectedEncounter) return;

    setLoading(true);
    setMessage(null);
    try {
      await outpatientService.recordVitalSigns({
        visitId: visit.id,
        encounterId: selectedEncounter.id,
        heightCm: parseFloat(heightCm) || 170,
        weightKg: parseFloat(weightKg) || 65,
        temperatureC: parseFloat(temperatureC) || 36.8,
        heartRateBpm: parseInt(heartRateBpm) || 78,
        systolicBp: parseInt(systolicBp) || 120,
        diastolicBp: parseInt(diastolicBp) || 80,
        spo2: parseFloat(spo2) || 98
      });

      await outpatientService.saveClinicalNote({
        visitId: visit.id,
        encounterId: selectedEncounter.id,
        templateId: 1,
        formData: formDataText
      });

      const updated = await outpatientService.getVisitDetail(visit.id);
      if (updated && updated.data) {
        setVisit(updated.data);
      }
      setMessage({ type: 'success', text: `Đã lưu thành công Chỉ số sinh tồn & Bệnh sử lâm sàng! Bước Chỉ định Cận lâm sàng hiện đã được kích hoạt (ACTIVE).` });
      fetchRoomQueue(queueTab);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi lưu thông tin sinh tồn: ' + (err.message || err.response?.data?.message || 'Không thể lưu') });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!visit || !selectedEncounter) return;
    if (!isVitalAndHistorySaved) {
      setMessage({ type: 'error', text: 'Vui lòng nhấn "Lưu Sinh Tồn & Bệnh Sử" (Bước 1) trước khi gửi Lệnh Chỉ Định Cận Lâm Sàng.' });
      return;
    }
    if (selectedServiceIds.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất 1 dịch vụ cận lâm sàng' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await outpatientService.createClinicalOrder({
        visitId: visit.id,
        encounterId: selectedEncounter.id,
        serviceIds: selectedServiceIds
      });
      if (res && res.data) {
        setVisit(res.data);
        setSelectedServiceIds([]);
        setShowRound2Form(false);
        const orderRound = res.data.clinicalOrders?.length || 1;
        setMessage({ type: 'success', text: `Đã phát hành Lệnh chỉ định CLS (Round ${orderRound}) thành công! Hóa đơn dịch vụ đã được gửi sang quầy Thu ngân.` });
        fetchRoomQueue(queueTab);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi tạo chỉ định: ' + (err.message || err.response?.data?.message || 'Không thể chỉ định') });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeVisit = async () => {
    if (!visit || !selectedEncounter) return;

    setLoading(true);
    setMessage(null);
    try {
      const wrapper = {
        prescription: {
          visitId: visit.id,
          encounterId: selectedEncounter.id,
          diagnosisNote: diagnosisNote,
          items: prescriptionItems
        },
        disposition: {
          visitId: visit.id,
          dispositionType: dispositionType,
          notes: dispositionNotes
        }
      };

      const res = await outpatientService.finalizeVisit(visit.id, wrapper);
      if (res && res.data) {
        setVisit(res.data);
        setMessage({ type: 'success', text: `Đã xuất Đơn thuốc điện tử & Hoàn tất Đợt khám (COMPLETED)!` });
        fetchRoomQueue(queueTab);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi hoàn tất đợt khám: ' + (err.message || err.response?.data?.message || 'Không thể đóng visit') });
    } finally {
      setLoading(false);
    }
  };

  const renderDiagnosticResultDetails = (result) => {
    if (!result) return null;
    let parsedData = null;
    if (result.resultData) {
      try {
        parsedData = typeof result.resultData === 'string' ? JSON.parse(result.resultData) : result.resultData;
      } catch (err) {
        // Fallback for non-JSON string
      }
    }

    const hasParams = parsedData && Array.isArray(parsedData.parameters) && parsedData.parameters.length > 0;

    return (
      <div className="space-y-2 mt-2">
        {/* Structured Parameter Table for CBC & Bio */}
        {hasParams ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-xs">
            <div className="bg-slate-100 p-2 border-b border-slate-200 font-extrabold text-slate-700 flex justify-between items-center text-[11px]">
              <span>BẢNG CHI TIẾT THÔNG SỐ XÉT NGHIỆM ({parsedData.serviceName || parsedData.serviceType || 'KTV TRẢ VỀ'})</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">STRUCTURED</span>
            </div>
            <div className="divide-y divide-slate-100">
              {parsedData.parameters.map((param, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{param.name || param.code}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Tham chiếu: {param.refRange || 'N/A'} {param.unit}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="font-mono font-extrabold text-slate-900 text-sm">
                      {param.value} <span className="text-xs text-slate-500 font-normal">{param.unit}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${
                      param.status === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      param.status === 'LOW' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {param.status === 'HIGH' ? 'Tăng ↑' : param.status === 'LOW' ? 'Giảm ↓' : 'Bình thường'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Text Findings */}
        {result.findings && (
          <div className="text-slate-800 font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <strong className="text-slate-500 block text-[10px] font-sans font-bold uppercase mb-0.5">Mô tả / Findings:</strong>
            {result.findings}
          </div>
        )}

        {/* Conclusion */}
        {result.conclusion && (
          <div className="text-emerald-900 font-extrabold text-xs bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
            Kết luận: {result.conclusion}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Banner Title Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <div className="text-xs font-bold text-teal-100 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bàn Khám Bác Sĩ & Trợ Lý Y Tế
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-teal-200" />
                Doctor & Assistant Consultation Workspace
              </h1>
              <p className="text-xs md:text-sm text-teal-100 mt-1 max-w-2xl">
                Khám lâm sàng, nhập chỉ số sinh tồn, bệnh sử ban đầu, chỉ định Cận lâm sàng (CLS Round 1 & Round 2), nhận KQ real-time từ KTV và kê đơn thuốc điện tử.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchRoomQueue(queueTab)}
                disabled={fetchingQueue}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 text-teal-200 ${fetchingQueue ? 'animate-spin' : ''}`} />
                Làm mới hàng chờ
              </button>
            </div>
          </div>
        </div>

        {/* Room Switcher Tabs */}
        {rooms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 px-3 uppercase tracking-wider">Phòng Khám:</span>
            {rooms.filter(r => r.roomType === 'CONSULTATION' || r.roomType === 'EXAM').map(room => (
              <button
                key={room.id}
                onClick={() => { setSelectedRoomId(room.id); setSelectedEncounter(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${selectedRoomId === room.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                Phòng {room.roomNumber} - {room.name}
              </button>
            ))}
          </div>
        )}

        {/* Feedback Alert Toast */}
        {message && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium transition-all ${message.type === 'success'
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

          {/* Left Column: Doctor Queue List (4 cols) */}
          <DoctorQueueList
            queue={queue}
            fetchingQueue={fetchingQueue}
            queueTab={queueTab}
            setQueueTab={setQueueTab}
            selectedEncounter={selectedEncounter}
            setSelectedEncounter={setSelectedEncounter}
            visit={visit}
            onStartEncounter={handleStartEncounter}
          />

          {/* Right Column: Doctor & Assistant Medical Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {visit ? (
              <div className="space-y-6">

                {/* Active Patient Overview Card Banner */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <ActivePatientBanner
                    visit={visit}
                    selectedEncounter={selectedEncounter}
                    patientHistoryCount={patientHistoryList?.length}
                    onOpenPatientProfile={openPatientProfileModal}
                    onOpenMedicalHistory={openMedicalHistoryModal}
                  />

                  {/* If encounter status is WAITING: Show Start Consultation Card */}
                  {selectedEncounter?.status === 'WAITING' ? (
                    <div className="bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/50 border border-teal-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
                      <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <PlayCircle className="w-10 h-10" />
                      </div>
                      <div className="space-y-2 max-w-lg mx-auto">
                        <h3 className="text-xl font-black text-slate-900">
                          Bệnh nhân sẵn sàng vào khám: {selectedEncounter?.patientName || visit?.patientName || 'N/A'}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Bệnh nhân đã hoàn tất Check-in tại quầy Lễ tân và đang ở trạng thái <strong className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">CHỜ KHÁM (WAITING)</strong>. 
                          Vui lòng nhấn nút <strong>"Bắt đầu khám"</strong> bên dưới để chuyển trạng thái sang <strong>IN PROGRESS</strong> và mở các màn hình nhập chỉ số sinh tồn, chẩn đoán bệnh sử, chỉ định CLS và kê đơn.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartEncounter(selectedEncounter)}
                        disabled={loading}
                        className="px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-teal-500/25 transition-all transform active:scale-95 inline-flex items-center gap-2"
                      >
                        <PlayCircle className="w-5 h-5 text-emerald-200" />
                        {loading ? 'Đang cập nhật...' : 'BẮT ĐẦU KHÁM LÂM SÀNG'}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Summary view displayed when visit is COMPLETED */}
                      <CompletedVisitSummaryCard
                        visit={visit}
                        diagnosisNote={diagnosisNote}
                        dispositionType={dispositionType}
                        dispositionNotes={dispositionNotes}
                        prescriptionItems={prescriptionItems}
                        formDataText={formDataText}
                      />

                      {/* Integrated Workspace Section 1: Vital Signs & Clinical Notes Input Form */}
                      <VitalSignsAndNoteForm
                        visit={visit}
                        loading={loading}
                        systolicBp={systolicBp} setSystolicBp={setSystolicBp}
                        diastolicBp={diastolicBp} setDiastolicBp={setDiastolicBp}
                        heartRateBpm={heartRateBpm} setHeartRateBpm={setHeartRateBpm}
                        temperatureC={temperatureC} setTemperatureC={setTemperatureC}
                        heightCm={heightCm} setHeightCm={setHeightCm}
                        weightKg={weightKg} setWeightKg={setWeightKg}
                        spo2={spo2} setSpo2={setSpo2}
                        formDataText={formDataText} setFormDataText={setFormDataText}
                        onSaveVitalAndNote={handleSaveVitalAndNote}
                      />

                      {/* Section 2: Clinical Orders & Issued Rounds Display */}
                      <ClinicalOrderRoundsForm
                        visit={visit}
                        loading={loading}
                        isVitalAndHistorySaved={isVitalAndHistorySaved}
                        showRound2Form={showRound2Form}
                        setShowRound2Form={setShowRound2Form}
                        selectedServiceIds={selectedServiceIds}
                        setSelectedServiceIds={setSelectedServiceIds}
                        catalog={catalog}
                        handleCreateOrder={handleCreateOrder}
                        renderDiagnosticResultDetails={renderDiagnosticResultDetails}
                      />

                      {/* Integrated Workspace Section 3: Diagnostic Results returned from Techs */}
                      <RealtimeDiagnosticResultsList
                        visit={visit}
                        renderDiagnosticResultDetails={renderDiagnosticResultDetails}
                      />

                      {/* Integrated Workspace Section 4: Electronic Prescription & Finalize Visit */}
                      <PrescriptionAndFinalizeForm
                        visit={visit}
                        loading={loading}
                        diagnosisNote={diagnosisNote} setDiagnosisNote={setDiagnosisNote}
                        dispositionType={dispositionType} setDispositionType={setDispositionType}
                        dispositionNotes={dispositionNotes} setDispositionNotes={setDispositionNotes}
                        prescriptionItems={prescriptionItems}
                        handleFinalizeVisit={handleFinalizeVisit}
                      />
                    </>
                  )}

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 text-xs space-y-3 shadow-sm">
                <Stethoscope className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-600">Vui lòng chọn 1 bệnh nhân từ hàng chờ bên trái để bắt đầu khám.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Patient Profile Modal Component */}
      <DoctorPatientProfileModal
        show={showPatientProfileModal}
        patientDetail={patientProfileDetail}
        visit={visit}
        selectedEncounter={selectedEncounter}
        onClose={() => setShowPatientProfileModal(false)}
      />

      {/* Medical History Modal Component */}
      <DoctorMedicalHistoryModal
        show={showMedicalHistoryModal}
        visit={visit}
        selectedEncounter={selectedEncounter}
        patientHistoryList={patientHistoryList}
        loadingHistory={loadingHistory}
        onClose={() => setShowMedicalHistoryModal(false)}
      />
    </div>
  );
}
