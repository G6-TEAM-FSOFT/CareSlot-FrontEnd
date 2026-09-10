import React from 'react';
import { FlaskConical } from 'lucide-react';

export default function CbcFormTemplate({
  cbc,
  evalStatus,
  handleCbcChange,
  buildCbcPayload,
  setCbc
}) {
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-600" />
          Thông Số Công Thức Máu Toàn Phần (CBC / Hematology)
        </h3>
        {/* Quick Sample Presets */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => {
              const normal = { wbc: 6.5, rbc: 4.8, hgb: 145, hct: 42.5, plt: 220, neut: 62.0, lymph: 28.5 };
              setCbc(normal);
              buildCbcPayload(normal);
            }}
            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg border border-emerald-300 transition"
          >
            Mẫu Bình Thường
          </button>
          <button
            type="button"
            onClick={() => {
              const highWbc = { wbc: 15.8, rbc: 4.8, hgb: 145, hct: 42.5, plt: 380, neut: 82.0, lymph: 12.5 };
              setCbc(highWbc);
              buildCbcPayload(highWbc);
            }}
            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg border border-rose-300 transition"
          >
            Mẫu WBC Tăng (Nhiễm trùng)
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        
        {/* WBC */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-slate-800">WBC (Bạch cầu)</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${evalStatus(cbc.wbc, 4.0, 10.0) === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {evalStatus(cbc.wbc, 4.0, 10.0) === 'NORMAL' ? 'Bình thường' : evalStatus(cbc.wbc, 4.0, 10.0) === 'HIGH' ? 'Tăng ↑' : 'Giảm ↓'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" value={cbc.wbc} onChange={e => handleCbcChange('wbc', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 focus:border-amber-500 outline-none" />
            <span className="text-slate-500 font-mono text-xs">G/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 4.0 - 10.0 G/L</div>
        </div>

        {/* RBC */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-slate-800">RBC (Hồng cầu)</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${evalStatus(cbc.rbc, 3.8, 5.4) === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {evalStatus(cbc.rbc, 3.8, 5.4) === 'NORMAL' ? 'Bình thường' : evalStatus(cbc.rbc, 3.8, 5.4) === 'HIGH' ? 'Tăng ↑' : 'Giảm ↓'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" value={cbc.rbc} onChange={e => handleCbcChange('rbc', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 focus:border-amber-500 outline-none" />
            <span className="text-slate-500 font-mono text-xs">T/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 3.8 - 5.4 T/L</div>
        </div>

        {/* HGB */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-slate-800">HGB (Huyết sắc tố)</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${evalStatus(cbc.hgb, 120, 165) === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {evalStatus(cbc.hgb, 120, 165) === 'NORMAL' ? 'Bình thường' : evalStatus(cbc.hgb, 120, 165) === 'HIGH' ? 'Tăng ↑' : 'Giảm ↓'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={cbc.hgb} onChange={e => handleCbcChange('hgb', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 focus:border-amber-500 outline-none" />
            <span className="text-slate-500 font-mono text-xs">g/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 120 - 165 g/L</div>
        </div>

        {/* HCT */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-slate-800">HCT (Dung tích H.cầu)</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${evalStatus(cbc.hct, 35.0, 48.0) === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {evalStatus(cbc.hct, 35.0, 48.0) === 'NORMAL' ? 'Bình thường' : evalStatus(cbc.hct, 35.0, 48.0) === 'HIGH' ? 'Tăng ↑' : 'Giảm ↓'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" value={cbc.hct} onChange={e => handleCbcChange('hct', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 focus:border-amber-500 outline-none" />
            <span className="text-slate-500 font-mono text-xs">%</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 35.0 - 48.0 %</div>
        </div>

        {/* PLT */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-slate-800">PLT (Tiểu cầu)</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${evalStatus(cbc.plt, 150, 450) === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {evalStatus(cbc.plt, 150, 450) === 'NORMAL' ? 'Bình thường' : evalStatus(cbc.plt, 150, 450) === 'HIGH' ? 'Tăng ↑' : 'Giảm ↓'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={cbc.plt} onChange={e => handleCbcChange('plt', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 focus:border-amber-500 outline-none" />
            <span className="text-slate-500 font-mono text-xs">G/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 150 - 450 G/L</div>
        </div>

        {/* NEUT */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-slate-800">NEUT% (B.cầu trung tính)</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${evalStatus(cbc.neut, 45.0, 75.0) === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {evalStatus(cbc.neut, 45.0, 75.0) === 'NORMAL' ? 'Bình thường' : evalStatus(cbc.neut, 45.0, 75.0) === 'HIGH' ? 'Tăng ↑' : 'Giảm ↓'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" value={cbc.neut} onChange={e => handleCbcChange('neut', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 focus:border-amber-500 outline-none" />
            <span className="text-slate-500 font-mono text-xs">%</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 45.0 - 75.0 %</div>
        </div>

      </div>
    </div>
  );
}
