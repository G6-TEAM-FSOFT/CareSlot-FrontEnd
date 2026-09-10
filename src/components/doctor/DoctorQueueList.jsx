import React from 'react';
import { Users, RefreshCw, PlayCircle, CheckCircle, Clock } from 'lucide-react';

export default function DoctorQueueList({
  queue,
  fetchingQueue,
  queueTab,
  setQueueTab,
  selectedEncounter,
  setSelectedEncounter,
  visit,
  onStartEncounter
}) {
  // Sort queue by createdAt / check-in time (earliest check-in first)
  const sortedQueue = [...(queue || [])].sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tA - tB;
  });

  return (
    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
      <div className="space-y-3 border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> Hàng Chờ Khám theo Thứ Tự Check-in
          </h2>
          <span className="text-xs font-mono font-bold text-amber-700 px-2.5 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
            {sortedQueue.length} Bệnh nhân
          </span>
        </div>

        {/* Status Switcher Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setQueueTab('ALL')}
            className={`py-1.5 rounded-lg transition ${queueTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setQueueTab('WAITING')}
            className={`py-1.5 rounded-lg transition ${queueTab === 'WAITING' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Chờ khám
          </button>
          <button
            type="button"
            onClick={() => setQueueTab('IN_PROGRESS')}
            className={`py-1.5 rounded-lg transition ${queueTab === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đang khám
          </button>
          <button
            type="button"
            onClick={() => setQueueTab('COMPLETED')}
            className={`py-1.5 rounded-lg transition ${queueTab === 'COMPLETED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đã xong
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
        {fetchingQueue ? (
          <div className="text-center py-10 text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" /> Đang lấy hàng chờ...
          </div>
        ) : sortedQueue.length > 0 ? (
          sortedQueue.map((enc, index) => {
            const isSelected = selectedEncounter?.id === enc.id;
            const isWaiting = enc.status === 'WAITING';
            const isInProgress = enc.status === 'IN_PROGRESS';
            const isCompleted = enc.status === 'COMPLETED' || visit?.status === 'COMPLETED';

            const checkInTimeStr = enc.createdAt ? new Date(enc.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

            return (
              <div
                key={enc.id}
                onClick={() => setSelectedEncounter(enc)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-500 text-slate-900 shadow-sm ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Consecutive STT order number */}
                    <span className="font-mono font-black text-white text-xs bg-teal-700 px-2 py-0.5 rounded-md shadow-sm">
                      STT #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono font-bold text-slate-600 text-xs">{enc.queueNumber}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                      enc.encounterType === 'FOLLOW_UP_CONSULTATION'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      {enc.encounterType === 'FOLLOW_UP_CONSULTATION' ? '🔄 Quay Lại Đọc KQ' : 'Lần Đầu'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      isInProgress ? 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isCompleted ? 'Đã xong' : isInProgress ? 'Đang khám' : 'Chờ khám'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {enc.patientName || 'Nguyễn Minh Anh'}
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    {enc.patientGender && <span>{enc.patientGender === 'MALE' ? 'Nam' : 'Nữ'}</span>}
                    {enc.patientPhone && <span>• SĐT: <strong className="text-slate-800 font-mono">{enc.patientPhone}</strong></span>}
                    <span className="text-[11px] text-teal-800 font-mono font-semibold bg-teal-50 px-1.5 py-0.2 rounded">
                      <Clock className="w-3 h-3 inline mr-1" />Check-in: {checkInTimeStr}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    BS phụ trách: <span className="text-slate-800 font-semibold">{enc.doctorName}</span>
                  </div>
                </div>

                {/* Start Consultation Action Button */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  {isWaiting ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEncounter(enc);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <PlayCircle className="w-4 h-4 text-emerald-200" />
                      BẮT ĐẦU KHÁM BỆNH
                    </button>
                  ) : isInProgress ? (
                    <div className="w-full py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      Đang khám lâm sàng...
                    </div>
                  ) : (
                    <div className="w-full py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Đã hoàn tất đợt khám
                    </div>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center text-slate-500 py-12 text-xs bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-medium text-slate-600">Không tìm thấy bệnh nhân nào trong tab hàng chờ này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
