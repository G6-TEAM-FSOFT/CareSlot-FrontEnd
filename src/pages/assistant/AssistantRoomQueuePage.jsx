import React, { useState, useEffect } from 'react';
import { outpatientService } from '../../services/outpatientService';
import { 
  Users, Activity, FileText, CheckCircle2, Clock, 
  Stethoscope, Save, UserCheck, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';

export default function AssistantRoomQueuePage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(1); // Room 305
  const [queue, setQueue] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQueue, setFetchingQueue] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states for Vital Signs
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('65');
  const [temperatureC, setTemperatureC] = useState('36.8');
  const [heartRateBpm, setHeartRateBpm] = useState('78');
  const [systolicBp, setSystolicBp] = useState('120');
  const [diastolicBp, setDiastolicBp] = useState('80');
  const [spo2, setSpo2] = useState('98');

  // Form state for Clinical Note
  const [formDataText, setFormDataText] = useState('Bệnh nhân đau vùng thượng vị 3 ngày, đau âm ỉ sau ăn, có tiền sử viêm dạ dày.');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      fetchQueue();
    }
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    try {
      const res = await outpatientService.getRooms(1);
      if (res && res.data) {
        // Filter consultation rooms
        const consultRooms = res.data.filter(r => r.roomType === 'CONSULTATION' || r.roomType === 'EXAM');
        setRooms(consultRooms.length > 0 ? consultRooms : res.data);
        if (consultRooms.length > 0) setSelectedRoomId(consultRooms[0].id);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách phòng:', err);
    }
  };

  const fetchQueue = async () => {
    setFetchingQueue(true);
    try {
      const res = await outpatientService.getEncounterQueueByRoom(selectedRoomId, 'WAITING');
      if (res && res.data) {
        setQueue(res.data);
        if (res.data.length > 0 && (!selectedEncounter || !res.data.some(e => e.id === selectedEncounter.id))) {
          setSelectedEncounter(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi lấy hàng chờ phòng:', err);
    } finally {
      setFetchingQueue(false);
    }
  };

  const handleSaveVitalAndNote = async (e) => {
    e.preventDefault();
    if (!selectedEncounter) return;

    setLoading(true);
    setMessage(null);
    try {
      // 1. Record vital signs API
      await outpatientService.recordVitalSigns({
        visitId: selectedEncounter.visitId || 1,
        encounterId: selectedEncounter.id,
        heightCm: parseFloat(heightCm) || 170,
        weightKg: parseFloat(weightKg) || 65,
        temperatureC: parseFloat(temperatureC) || 36.5,
        heartRateBpm: parseInt(heartRateBpm) || 75,
        systolicBp: parseInt(systolicBp) || 120,
        diastolicBp: parseInt(diastolicBp) || 80,
        spo2: parseFloat(spo2) || 98,
      });

      // 2. Record clinical note API
      await outpatientService.saveClinicalNote({
        visitId: selectedEncounter.visitId || 1,
        encounterId: selectedEncounter.id,
        templateId: 1,
        formData: formDataText,
      });

      setMessage({ type: 'success', text: `Đã lưu thành công Chỉ số sinh tồn & Bệnh sử lâm sàng cho STT: ${selectedEncounter.queueNumber}!` });
      fetchQueue();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi lưu dữ liệu: ' + (err.message || err.response?.data?.message || 'Không thể lưu') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Title Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-800 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <div className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bàn Tiền Khám & Sàng Lọc Lâm Sàng
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-indigo-200" />
                Trợ Lý Y Tế / Điều Dưỡng Buồng Khám (Clinical Assistant Workspace)
              </h1>
              <p className="text-xs md:text-sm text-indigo-100 mt-1 max-w-2xl">
                Đo và đo kiểm các chỉ số sinh tồn (Vital Signs), lắng nghe bệnh sử ban đầu của bệnh nhân trước khi bác sĩ bắt đầu lượt khám chính.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchQueue}
                disabled={fetchingQueue}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 text-indigo-200 ${fetchingQueue ? 'animate-spin' : ''}`} />
                Làm mới hàng chờ
              </button>
            </div>
          </div>
        </div>

        {/* Room Switcher Dropdown / Tabs */}
        {rooms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 px-3 uppercase tracking-wider">Chọn Buồng Khám:</span>
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => { setSelectedRoomId(room.id); setSelectedEncounter(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  selectedRoomId === room.id
                    ? 'bg-indigo-600 text-white shadow-sm'
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
          
          {/* Left Column: Room Waiting Queue (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Hàng Chờ Tiền Khám
              </h2>
              <span className="text-xs font-mono font-bold text-amber-700 px-2.5 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
                {queue.length} Đang chờ
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {fetchingQueue ? (
                <div className="text-center py-10 text-slate-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> Đang lấy hàng chờ...
                </div>
              ) : queue.length > 0 ? (
                queue.map(enc => (
                  <div
                    key={enc.id}
                    onClick={() => setSelectedEncounter(enc)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedEncounter?.id === enc.id
                        ? 'bg-indigo-50 border-indigo-500 text-slate-900 shadow-sm ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-black text-amber-700 text-sm">{enc.queueNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                        {enc.encounterType === 'INITIAL_CONSULTATION' ? 'Lần Đầu' : 'Tái Khám'}
                      </span>
                    </div>

                    <div className="font-extrabold text-slate-900 text-sm">
                      {enc.patientName || 'Nguyễn Minh Anh'}
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      {enc.patientGender && <span>{enc.patientGender === 'MALE' ? 'Nam' : 'Nữ'}</span>}
                      {enc.patientPhone && <span>• SĐT: <strong className="text-slate-800 font-mono">{enc.patientPhone}</strong></span>}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      Bác sĩ khám: <span className="text-slate-800 font-semibold">{enc.doctorName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Phòng: {enc.roomName} ({enc.roomNumber})
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-12 text-xs bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-medium text-slate-600">Không có bệnh nhân chờ ở buồng khám này.</p>
                  <p className="text-[11px] text-slate-400">Bệnh nhân cần được Lễ tân Check-in để xuất hiện ở hàng chờ.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Input Form (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Activity className="w-5 h-5 text-indigo-600" /> Nhập Chỉ Số Sinh Tồn & Bệnh Sử Ban Đầu
            </h2>

            {selectedEncounter ? (
              <form onSubmit={handleSaveVitalAndNote} className="space-y-6">
                
                {/* Active Patient Card Banner */}
                <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 space-y-2 relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-2">
                    <div className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">
                      ĐANG NHẬP DỮ LIỆU CHO BỆNH NHÂN:
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-xl">
                      ENCOUNTER WAITING
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        {selectedEncounter.patientName || 'Nguyễn Minh Anh'}
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 mt-1">
                        <span>Số STT: <strong className="text-amber-700 font-mono text-sm">{selectedEncounter.queueNumber}</strong></span>
                        <span>•</span>
                        <span>Giới tính: <strong className="text-slate-800">{selectedEncounter.patientGender === 'MALE' ? 'Nam' : 'Nữ'}</strong></span>
                        <span>•</span>
                        <span>SĐT: <strong className="text-indigo-700 font-mono">{selectedEncounter.patientPhone || '0901234567'}</strong></span>
                        {selectedEncounter.patientDob && (
                          <>
                            <span>•</span>
                            <span>Ngày sinh: <strong className="text-slate-700">{selectedEncounter.patientDob}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-indigo-200 text-xs text-slate-500 flex flex-wrap items-center gap-4">
                    <div>Bác sĩ phụ trách: <strong className="text-emerald-700 font-semibold">{selectedEncounter.doctorName}</strong></div>
                    {selectedEncounter.bookingCode && <div>Mã Booking: <strong className="text-indigo-700 font-mono">{selectedEncounter.bookingCode}</strong></div>}
                    {selectedEncounter.visitCode && <div>Mã Visit: <strong className="text-indigo-700 font-mono">{selectedEncounter.visitCode}</strong></div>}
                  </div>
                </div>

                {/* Vital Signs Grid Inputs */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" /> Chỉ Số Sinh Tồn (Vital Signs):
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">HA Tâm thu (mmHg)</label>
                      <input 
                        type="number" 
                        value={systolicBp} 
                        onChange={e => setSystolicBp(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1">HA Tâm trương (mmHg)</label>
                      <input 
                        type="number" 
                        value={diastolicBp} 
                        onChange={e => setDiastolicBp(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Mạch (Nhip/phút)</label>
                      <input 
                        type="number" 
                        value={heartRateBpm} 
                        onChange={e => setHeartRateBpm(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Nhiệt độ (°C)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={temperatureC} 
                        onChange={e => setTemperatureC(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Chiều cao (cm)</label>
                      <input 
                        type="number" 
                        value={heightCm} 
                        onChange={e => setHeightCm(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Cân nặng (kg)</label>
                      <input 
                        type="number" 
                        value={weightKg} 
                        onChange={e => setWeightKg(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm" 
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 block mb-1">SpO2 (%)</label>
                      <input 
                        type="number" 
                        value={spo2} 
                        onChange={e => setSpo2(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Note Area */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                    Bệnh Sử & Triệu Chứng Ban Đầu (Anamnesis Draft Note):
                  </label>
                  <textarea
                    rows={4}
                    value={formDataText}
                    onChange={e => setFormDataText(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-mono shadow-sm"
                    placeholder="Lý do khám, thời gian bắt đầu đau, tiền sử dị ứng thuốc..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  LƯU CHỈ SỐ SINH TỒN & GỬI BÁC SĨ KHÁM
                </button>

              </form>
            ) : (
              <div className="text-center text-slate-500 py-20 text-xs space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-600">Vui lòng chọn 1 lượt khám từ danh sách hàng chờ bên trái.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

