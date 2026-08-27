import React, { useState } from 'react';
import { Sparkles, ArrowRight, Activity, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AiSuggestPage = () => {
  const [symptom, setSymptom] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setSuggestion({
        specialty: 'Chuyên khoa Thần kinh & Nội tổng quát',
        confidence: '95%',
        recommendation: 'Dựa trên mô tả triệu chứng "đau đầu kéo dài, chóng mặt, mất ngủ", bạn được đề xuất đăng ký khám chuyên khoa Thần kinh để kiểm tra sâu.',
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="w-4 h-4" /> AI Specialty Suggestion Module
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Gợi Ý Chuyên Khoa Theo Triệu Chứng</h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Mô tả cảm giác hoặc các triệu chứng sức khỏe bạn đang gặp phải, AI sẽ hỗ trợ định hướng chuyên khoa phù hợp trước khi đặt lịch.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả triệu chứng của bạn</label>
            <textarea
              rows={4}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Ví dụ: Đau đầu hai bên thái dương, chóng mặt khi đứng dậy, thường xuyên mất ngủ về đêm..."
              className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !symptom.trim()}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Đang phân tích triệu chứng...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Phân Tích & Gợi Ý Chuyên Khoa
              </>
            )}
          </button>
        </form>
      </div>

      {suggestion && (
        <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 p-6 md:p-8 rounded-3xl border border-indigo-100 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
            <Activity className="w-6 h-6 text-indigo-600" />
            Gợi Ý: {suggestion.specialty}
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{suggestion.recommendation}</p>
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            Lưu ý: Gợi ý từ AI mang tính chất tham khảo định hướng, không thay thế chẩn đoán y khoa chính thức.
          </div>

          <div className="pt-2">
            <Link
              to="/clinics"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-700 transition"
            >
              Tìm Phòng Khám Thuộc Chuyên Khoa Này <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
