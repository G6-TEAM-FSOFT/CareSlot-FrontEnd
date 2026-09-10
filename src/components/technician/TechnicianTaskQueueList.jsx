import React from 'react';
import { Clock, RefreshCw, FlaskConical, User, Stethoscope, FileText } from 'lucide-react';

export default function TechnicianTaskQueueList({
  tasks,
  fetchingTasks,
  selectedTask,
  setSelectedTask
}) {
  // Sort tasks by createdAt / arrival time
  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tA - tB;
  });

  return (
    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" /> Hàng Chờ Thực Hiện Dịch Vụ
        </h2>
        <span className="text-xs font-mono font-bold text-amber-800 px-2.5 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
          {sortedTasks.length} Bệnh nhân
        </span>
      </div>

      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
        {fetchingTasks ? (
          <div className="text-center py-10 text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600" /> Đang tải danh sách task CLS...
          </div>
        ) : sortedTasks.length > 0 ? (
          sortedTasks.map((sr, index) => {
            const isSelected = selectedTask?.id === sr.id;
            const patientName = sr.patientName || 'Bệnh nhân';
            const phone = sr.patientPhone;
            const gender = sr.patientGender;
            const doctorName = sr.orderedByName || 'BS. Chuyên Khoa';
            const taskQueueNo = sr.task?.queueNumber || `TASK-#${sr.id}`;

            return (
              <div
                key={sr.id}
                onClick={() => setSelectedTask(sr)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-500 text-slate-900 shadow-sm ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Consecutive STT order number */}
                    <span className="font-mono font-black text-white text-xs bg-amber-600 px-2 py-0.5 rounded-md shadow-sm">
                      STT #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono font-bold text-amber-900 text-xs bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      {taskQueueNo}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                    READY
                  </span>
                </div>

                {/* Patient Information Section */}
                <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>{patientName}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2 pl-5">
                    {gender && (
                      <span className="font-semibold text-slate-700">
                        {gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      </span>
                    )}
                    {phone && (
                      <span>• SĐT: <strong className="font-mono text-slate-800">{phone}</strong></span>
                    )}
                    {sr.bookingCode && (
                      <span className="text-cyan-800 font-mono font-semibold">({sr.bookingCode})</span>
                    )}
                  </div>
                </div>

                {/* Service Task Information */}
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                    <span>{sr.serviceName}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
                    <span>Mã DV: <strong className="font-mono text-slate-700">{sr.serviceCode}</strong></span>
                    <span className="font-mono font-extrabold text-emerald-700">{sr.price ? sr.price.toLocaleString('vi-VN') : 0} VNĐ</span>
                  </div>

                  {doctorName && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-emerald-600" />
                      <span>BS chỉ định: <strong className="text-slate-800">{doctorName}</strong></span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center text-slate-500 py-12 text-xs bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
            <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-medium text-slate-600">Không có task CLS nào ở trạng thái READY.</p>
            <p className="text-[11px] text-slate-500">Bệnh nhân cần thanh toán hóa đơn ở Lễ tân để chuyển task sang READY.</p>
          </div>
        )}
      </div>
    </div>
  );
}
