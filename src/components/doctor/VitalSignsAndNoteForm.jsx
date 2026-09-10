import React from 'react';
import { Activity, Save } from 'lucide-react';

export default function VitalSignsAndNoteForm({
  visit,
  loading,
  systolicBp, setSystolicBp,
  diastolicBp, setDiastolicBp,
  heartRateBpm, setHeartRateBpm,
  temperatureC, setTemperatureC,
  heightCm, setHeightCm,
  weightKg, setWeightKg,
  spo2, setSpo2,
  formDataText, setFormDataText,
  onSaveVitalAndNote
}) {
  if (!visit || visit.status === 'COMPLETED') return null;

  return (
    <form onSubmit={onSaveVitalAndNote} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          1. Nhập Chỉ Số Sinh Tồn & Bệnh Sử Ban Đầu (Trợ Lý / Bác Sĩ)
        </h3>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-xs rounded-xl shadow-sm active:scale-95 flex items-center gap-1.5 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Lưu Sinh Tồn & Bệnh Sử
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-slate-600 block mb-1">HA Tâm thu (mmHg)</label>
          <input type="number" value={systolicBp} onChange={e => setSystolicBp(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>
        <div>
          <label className="text-slate-600 block mb-1">HA Tâm trương (mmHg)</label>
          <input type="number" value={diastolicBp} onChange={e => setDiastolicBp(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>
        <div>
          <label className="text-slate-600 block mb-1">Mạch (Nhip/p)</label>
          <input type="number" value={heartRateBpm} onChange={e => setHeartRateBpm(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>
        <div>
          <label className="text-slate-600 block mb-1">Nhiệt độ (°C)</label>
          <input type="number" step="0.1" value={temperatureC} onChange={e => setTemperatureC(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>
        <div>
          <label className="text-slate-600 block mb-1">Chiều cao (cm)</label>
          <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>
        <div>
          <label className="text-slate-600 block mb-1">Cân nặng (kg)</label>
          <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>
        <div>
          <label className="text-slate-600 block mb-1">SpO2 (%)</label>
          <input type="number" value={spo2} onChange={e => setSpo2(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <label className="font-extrabold text-slate-800 block">Bệnh Sử & Triệu Chứng Ban Đầu (Anamnesis Note):</label>
        <textarea
          rows={3}
          value={formDataText}
          onChange={e => setFormDataText(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none font-mono"
          placeholder="Nhập bệnh sử, triệu chứng lâm sàng..."
        />
      </div>
    </form>
  );
}
