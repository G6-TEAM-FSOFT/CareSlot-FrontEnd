import React, { useState, useEffect } from 'react';
import { outpatientService } from '../../services/outpatientService';
import { 
  CheckCircle2, FileText, Send, FlaskConical, RefreshCw, Sparkles, User, Stethoscope
} from 'lucide-react';

import TechnicianTaskQueueList from '../../components/technician/TechnicianTaskQueueList';
import CbcFormTemplate from '../../components/technician/CbcFormTemplate';
import BioFormTemplate from '../../components/technician/BioFormTemplate';
import ImagingFormTemplate from '../../components/technician/ImagingFormTemplate';

export default function TechnicianTaskQueuePage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(2); // Room A101 Lab collection
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTasks, setFetchingTasks] = useState(false);
  const [message, setMessage] = useState(null);

  const [templateType, setTemplateType] = useState('CBC'); // 'CBC' | 'BIO' | 'IMAGING'

  // Structured Form States: CBC
  const [cbc, setCbc] = useState({
    wbc: 6.5,   // Ref: 4.0 - 10.0 G/L
    rbc: 4.8,   // Ref: 3.8 - 5.4 T/L
    hgb: 145,   // Ref: 120 - 165 g/L
    hct: 42.5,  // Ref: 35.0 - 48.0 %
    plt: 220,   // Ref: 150 - 450 G/L
    neut: 62.0, // Ref: 45.0 - 75.0 %
    lymph: 28.5 // Ref: 20.0 - 40.0 %
  });

  // Structured Form States: Sinh Hóa Máu (Bio)
  const [bio, setBio] = useState({
    glucose: 5.2,    // Ref: 3.9 - 6.4 mmol/L
    urea: 4.8,       // Ref: 2.5 - 7.5 mmol/L
    creatinine: 78,  // Ref: 53 - 106 umol/L
    ast: 24,         // Ref: < 37 U/L
    alt: 28          // Ref: < 40 U/L
  });

  // Structured Form States: Chẩn Đoán Hình Ảnh (Siêu Âm B202, CT Scanner B202...)
  const [imaging, setImaging] = useState({
    serviceType: 'ULTRASOUND',
    organ: 'Ổ bụng tổng quát',
    findingStatus: 'Bình thường',
    observation: 'Gan, mật, tụy, lách, hai thận kích thước và cấu trúc nhu mô bình thường. Không thấy dịch tự do ổ bụng.',
    recommendation: 'Không phát hiện bất thường trên hình ảnh chẩn đoán.'
  });

  // Base Form Fields
  const [findings, setFindings] = useState('Công thức máu các thông số trong giới hạn sinh lý bình thường.');
  const [conclusion, setConclusion] = useState('Công thức máu (CBC) bình thường.');
  const [resultData, setResultData] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      fetchTasks();
    }
  }, [selectedRoomId]);

  // Auto-detect template when task changes
  useEffect(() => {
    if (selectedTask) {
      const code = (selectedTask.serviceCode || '').toUpperCase();
      const name = (selectedTask.serviceName || '').toUpperCase();

      if (code.includes('CBC') || code.includes('MAU') || name.includes('MÁU') || name.includes('HUYẾT HỌC') || name.includes('CBC')) {
        setTemplateType('CBC');
        buildCbcPayload(cbc);
      } else if (code.includes('BIO') || code.includes('SHM') || name.includes('SINH HÓA') || name.includes('GLUCOSE')) {
        setTemplateType('BIO');
        buildBioPayload(bio);
      } else {
        setTemplateType('IMAGING');
        const imgType = name.includes('CT') || code.includes('CT') ? 'CT_SCAN' : 'ULTRASOUND';
        const nextImg = { ...imaging, serviceType: imgType };
        setImaging(nextImg);
        buildImagingPayload(nextImg);
      }
    }
  }, [selectedTask]);

  const fetchRooms = async () => {
    try {
      const res = await outpatientService.getRooms(1);
      if (res && res.data) {
        const diagRooms = res.data.filter(r => r.roomType !== 'CONSULTATION' && r.roomType !== 'CASHIER');
        setRooms(diagRooms.length > 0 ? diagRooms : res.data);
        if (diagRooms.length > 0) setSelectedRoomId(diagRooms[0].id);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách phòng CLS:', err);
    }
  };

  const fetchTasks = async () => {
    setFetchingTasks(true);
    try {
      const res = await outpatientService.getTaskQueueByRoom(selectedRoomId, 'READY');
      if (res && res.data) {
        setTasks(res.data);
        if (res.data.length > 0 && (!selectedTask || !res.data.some(t => t.id === selectedTask.id))) {
          setSelectedTask(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi lấy hàng chờ phòng CLS:', err);
    } finally {
      setFetchingTasks(false);
    }
  };

  const evalStatus = (val, min, max) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'NORMAL';
    if (min !== null && num < min) return 'LOW';
    if (max !== null && num > max) return 'HIGH';
    return 'NORMAL';
  };

  const buildCbcPayload = (newCbc) => {
    const params = [
      { code: 'WBC', name: 'Số lượng Bạch cầu (WBC)', value: parseFloat(newCbc.wbc) || 0, unit: 'G/L', refRange: '4.0 - 10.0', status: evalStatus(newCbc.wbc, 4.0, 10.0) },
      { code: 'RBC', name: 'Số lượng Hồng cầu (RBC)', value: parseFloat(newCbc.rbc) || 0, unit: 'T/L', refRange: '3.8 - 5.4', status: evalStatus(newCbc.rbc, 3.8, 5.4) },
      { code: 'HGB', name: 'Huyết sắc tố (HGB)', value: parseFloat(newCbc.hgb) || 0, unit: 'g/L', refRange: '120 - 165', status: evalStatus(newCbc.hgb, 120, 165) },
      { code: 'HCT', name: 'Dung tích hồng cầu (HCT)', value: parseFloat(newCbc.hct) || 0, unit: '%', refRange: '35.0 - 48.0', status: evalStatus(newCbc.hct, 35.0, 48.0) },
      { code: 'PLT', name: 'Số lượng Tiểu cầu (PLT)', value: parseFloat(newCbc.plt) || 0, unit: 'G/L', refRange: '150 - 450', status: evalStatus(newCbc.plt, 150, 450) },
      { code: 'NEUT', name: 'Bạch cầu Trung tính (NEUT%)', value: parseFloat(newCbc.neut) || 0, unit: '%', refRange: '45.0 - 75.0', status: evalStatus(newCbc.neut, 45.0, 75.0) },
      { code: 'LYMPH', name: 'Bạch cầu Lympho (LYMPH%)', value: parseFloat(newCbc.lymph) || 0, unit: '%', refRange: '20.0 - 40.0', status: evalStatus(newCbc.lymph, 20.0, 40.0) }
    ];

    const payloadObj = {
      serviceType: 'CBC',
      serviceName: 'Công thức máu toàn phần (CBC)',
      parameters: params
    };

    setResultData(JSON.stringify(payloadObj, null, 2));

    const abnormal = params.filter(p => p.status !== 'NORMAL');
    if (abnormal.length > 0) {
      const desc = abnormal.map(a => `${a.code} ${a.status === 'HIGH' ? 'tăng' : 'giảm'} (${a.value} ${a.unit})`).join(', ');
      setFindings(`Phát hiện bất thường: ${desc}. Các chỉ số còn lại trong giới hạn.`);
      setConclusion(`Công thức máu nghi ngờ ${abnormal.map(a => a.code).join('/')} bất thường.`);
    } else {
      setFindings(`WBC: ${newCbc.wbc} G/L | RBC: ${newCbc.rbc} T/L | HGB: ${newCbc.hgb} g/L | HCT: ${newCbc.hct}% | PLT: ${newCbc.plt} G/L. Các chỉ số trong giới hạn sinh lý bình thường.`);
      setConclusion(`Công thức máu (CBC) bình thường.`);
    }
  };

  const buildBioPayload = (newBio) => {
    const params = [
      { code: 'GLUCOSE', name: 'Đường huyết (Glucose)', value: parseFloat(newBio.glucose) || 0, unit: 'mmol/L', refRange: '3.9 - 6.4', status: evalStatus(newBio.glucose, 3.9, 6.4) },
      { code: 'UREA', name: 'Urê máu (Urea)', value: parseFloat(newBio.urea) || 0, unit: 'mmol/L', refRange: '2.5 - 7.5', status: evalStatus(newBio.urea, 2.5, 7.5) },
      { code: 'CREATININE', name: 'Creatinine máu', value: parseFloat(newBio.creatinine) || 0, unit: 'umol/L', refRange: '53 - 106', status: evalStatus(newBio.creatinine, 53, 106) },
      { code: 'AST', name: 'Men gan AST (GOT)', value: parseFloat(newBio.ast) || 0, unit: 'U/L', refRange: '< 37', status: evalStatus(newBio.ast, null, 37) },
      { code: 'ALT', name: 'Men gan ALT (GPT)', value: parseFloat(newBio.alt) || 0, unit: 'U/L', refRange: '< 40', status: evalStatus(newBio.alt, null, 40) }
    ];

    const payloadObj = {
      serviceType: 'BIOCHEMISTRY',
      serviceName: 'Sinh hóa máu',
      parameters: params
    };

    setResultData(JSON.stringify(payloadObj, null, 2));

    const abnormal = params.filter(p => p.status !== 'NORMAL');
    if (abnormal.length > 0) {
      setFindings(`Sinh hóa bất thường: ${abnormal.map(a => `${a.name}: ${a.value} ${a.unit}`).join('; ')}.`);
      setConclusion(`Chỉ số sinh hóa máu bất thường (${abnormal.map(a => a.code).join(', ')}).`);
    } else {
      setFindings(`Glucose: ${newBio.glucose} mmol/L | Urea: ${newBio.urea} mmol/L | Creatinine: ${newBio.creatinine} umol/L | AST: ${newBio.ast} U/L | ALT: ${newBio.alt} U/L. Chức năng gan thận & đường huyết bình thường.`);
      setConclusion(`Sinh hóa máu bình thường.`);
    }
  };

  const buildImagingPayload = (newImg) => {
    const payloadObj = {
      serviceType: newImg.serviceType || 'IMAGING',
      organ: newImg.organ || 'Ổ bụng tổng quát',
      findingStatus: newImg.findingStatus || 'Bình thường',
      observation: newImg.observation || '',
      recommendation: newImg.recommendation || ''
    };

    setResultData(JSON.stringify(payloadObj, null, 2));
    setFindings(`Bộ phận: ${newImg.organ}. ${newImg.observation}`);
    setConclusion(`Kết quả Chẩn đoán hình ảnh: ${newImg.findingStatus}. ${newImg.recommendation || ''}`);
  };

  const handleCbcChange = (field, value) => {
    const next = { ...cbc, [field]: value };
    setCbc(next);
    buildCbcPayload(next);
  };

  const handleBioChange = (field, value) => {
    const next = { ...bio, [field]: value };
    setBio(next);
    buildBioPayload(next);
  };

  const handleImagingChange = (field, value) => {
    const next = { ...imaging, [field]: value };
    setImaging(next);
    buildImagingPayload(next);
  };

  const handleSubmitResult = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTask || !selectedTask.task) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await outpatientService.submitDiagnosticResult({
        serviceTaskId: selectedTask.task.id,
        findings: findings,
        conclusion: conclusion,
        resultData: resultData
      });

      if (res && res.data) {
        setMessage({ 
          type: 'success', 
          text: `Đã trả & FINAL thành công kết quả cho dịch vụ "${selectedTask.serviceName}"! Hệ thống đã ghi nhận đầy đủ các thông số chi tiết vào cơ sở dữ liệu.` 
        });
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi trả kết quả: ' + (err.message || err.response?.data?.message || 'Không thể gửi kết quả') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Title Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <div className="text-xs font-bold text-amber-100 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bàn Thực Hiện Dịch Vụ Cận Lâm Sàng Chi Tiết
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                <FlaskConical className="w-8 h-8 text-amber-200" />
                Technician Detailed Diagnostic Workspace
              </h1>
              <p className="text-xs md:text-sm text-amber-100 mt-1 max-w-2xl">
                Nhập đầy đủ các thông số chỉ số xét nghiệm (CBC Công thức máu, Sinh hóa, Siêu âm...), hiển thị cảnh báo chỉ số Tăng/Giảm tự động và lưu lưu trữ JSON vào Database.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTasks}
                disabled={fetchingTasks}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 text-amber-200 ${fetchingTasks ? 'animate-spin' : ''}`} />
                Làm mới hàng chờ
              </button>
            </div>
          </div>
        </div>

        {/* Room Switcher Tabs */}
        {rooms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 px-3 uppercase tracking-wider">Phòng Cận Lâm Sàng:</span>
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => { setSelectedRoomId(room.id); setSelectedTask(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  selectedRoomId === room.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
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
          
          {/* Left Column: Task Queue List Component (4 cols) */}
          <TechnicianTaskQueueList
            tasks={tasks}
            fetchingTasks={fetchingTasks}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
          />

          {/* Right Column: Detailed Result Entry Workspace (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Bảng Nhập Thông Số Cận Lâm Sàng & Duyệt FINAL
              </h2>
            </div>

            {selectedTask ? (
              <form onSubmit={handleSubmitResult} className="space-y-6">
                
                {/* Active Task Info Card */}
                <div className="bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bệnh nhân thực hiện:</span>
                      <div className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-600" />
                        <span>{selectedTask.patientName || 'Nguyễn Minh Anh'}</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        {selectedTask.patientGender && <span>Giới tính: <strong>{selectedTask.patientGender === 'MALE' ? 'Nam' : 'Nữ'}</strong></span>}
                        {selectedTask.patientDob && <span>• NS: <span className="font-mono">{selectedTask.patientDob}</span></span>}
                        {selectedTask.patientPhone && <span>• SĐT: <strong className="font-mono">{selectedTask.patientPhone}</strong></span>}
                        {selectedTask.bookingCode && <span>• Booking: <span className="font-mono text-cyan-800 font-bold">{selectedTask.bookingCode}</span></span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl">
                        MẪU: {templateType}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Dịch vụ chỉ định:</span>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-600" />
                        {selectedTask.serviceName}
                      </div>
                      <div className="text-xs text-amber-800 font-mono font-bold mt-0.5">
                        Mã DV: {selectedTask.serviceCode} • Mã Task: {selectedTask.task?.queueNumber || `TASK-#${selectedTask.id}`}
                      </div>
                    </div>

                    {selectedTask.orderedByName && (
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bác sĩ chỉ định:</span>
                        <div className="font-bold text-emerald-700 flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                          {selectedTask.orderedByName}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* STRUCTURED ENTRY FORM TEMPLATES */}
                <div className="space-y-6">

                  {/* CBC Template Structured Form Component */}
                  {templateType === 'CBC' && (
                    <CbcFormTemplate
                      cbc={cbc}
                      evalStatus={evalStatus}
                      handleCbcChange={handleCbcChange}
                      buildCbcPayload={buildCbcPayload}
                      setCbc={setCbc}
                    />
                  )}

                  {/* BIO Template Structured Form Component */}
                  {templateType === 'BIO' && (
                    <BioFormTemplate
                      bio={bio}
                      handleBioChange={handleBioChange}
                    />
                  )}

                  {/* IMAGING / ULTRASOUND / CT SCANNER Form Component */}
                  {templateType === 'IMAGING' && (
                    <ImagingFormTemplate
                      imaging={imaging}
                      handleImagingChange={handleImagingChange}
                      setImaging={setImaging}
                      buildImagingPayload={buildImagingPayload}
                    />
                  )}

                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Mô Tả Chi Tiết / Thao Tác Kỹ Thuật (Findings):
                  </label>
                  <textarea
                    rows={3}
                    value={findings}
                    onChange={e => setFindings(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Kết Luận Chẩn Đoán (Conclusion):
                  </label>
                  <input
                    type="text"
                    value={conclusion}
                    onChange={e => setConclusion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 font-extrabold text-white text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  XÁC NHẬN & BẤM FINAL KẾT QUẢ
                </button>

              </form>
            ) : (
              <div className="text-center text-slate-500 py-20 text-xs space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-600">Vui lòng chọn 1 task từ danh sách hàng chờ bên trái để nhập kết quả.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
