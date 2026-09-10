import React from 'react';
import { FlaskConical } from 'lucide-react';

export default function BioFormTemplate({
  bio,
  handleBioChange
}) {
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-3">
        <FlaskConical className="w-4 h-4 text-amber-600" />
        Thông Số Sinh Hóa Máu (Biochemistry)
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <span className="font-extrabold text-slate-800 block">Glucose (Đường huyết)</span>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" value={bio.glucose} onChange={e => handleBioChange('glucose', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 outline-none" />
            <span className="text-slate-500 font-mono text-xs">mmol/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 3.9 - 6.4 mmol/L</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <span className="font-extrabold text-slate-800 block">Urea (Urê máu)</span>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" value={bio.urea} onChange={e => handleBioChange('urea', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 outline-none" />
            <span className="text-slate-500 font-mono text-xs">mmol/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 2.5 - 7.5 mmol/L</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <span className="font-extrabold text-slate-800 block">Creatinine</span>
          <div className="flex items-center gap-2">
            <input type="number" value={bio.creatinine} onChange={e => handleBioChange('creatinine', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 outline-none" />
            <span className="text-slate-500 font-mono text-xs">umol/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: 53 - 106 umol/L</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <span className="font-extrabold text-slate-800 block">AST (GOT)</span>
          <div className="flex items-center gap-2">
            <input type="number" value={bio.ast} onChange={e => handleBioChange('ast', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 outline-none" />
            <span className="text-slate-500 font-mono text-xs">U/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: &lt; 37 U/L</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <span className="font-extrabold text-slate-800 block">ALT (GPT)</span>
          <div className="flex items-center gap-2">
            <input type="number" value={bio.alt} onChange={e => handleBioChange('alt', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-sm font-bold text-slate-900 outline-none" />
            <span className="text-slate-500 font-mono text-xs">U/L</span>
          </div>
          <div className="text-[10px] text-slate-400">Tham chiếu: &lt; 40 U/L</div>
        </div>
      </div>
    </div>
  );
}
