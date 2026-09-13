import React, { useState } from 'react';
import { Clock, RefreshCw, FlaskConical, User, Stethoscope, FileText, CheckCircle2, Search, ChevronRight } from 'lucide-react';

export default function TechnicianTaskQueueList({
  tasks = [],
  fetchingTasks,
  selectedTask,
  setSelectedTask,
  activeTab = 'WAITING',
  setActiveTab
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort tasks by createdAt / arrival time
  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return activeTab === 'COMPLETED' ? tB - tA : tA - tB;
  });

  // Filter tasks based on search input
  const filteredTasks = sortedTasks.filter((sr) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (sr.patientName || '').toLowerCase().includes(term) ||
      (sr.patientPhone || '').toLowerCase().includes(term) ||
      (sr.bookingCode || '').toLowerCase().includes(term) ||
      (sr.serviceName || '').toLowerCase().includes(term) ||
      (sr.serviceCode || '').toLowerCase().includes(term) ||
      (sr.task?.queueNumber || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col h-full">
      
      {/* Sub-tabs Header Switcher */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('WAITING')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'WAITING'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Hàng Chờ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('COMPLETED')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Lịch Sử Đã Xong</span>
        </button>
      </div>

      {/* Header Info & Count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {activeTab === 'WAITING' ? (
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ Thực Hiện Dịch Vụ
            </span>
          ) : (
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kết Quả Đã Hoàn Tất
            </span>
          )}
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
          activeTab === 'WAITING' 
            ? 'text-amber-800 bg-amber-50 border-amber-200' 
            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
        }`}>
          {filteredTasks.length} {activeTab === 'WAITING' ? 'Chờ' : 'Đã xong'}
        </span>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm tên, SĐT, mã task..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Queue Task List Items */}
      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 flex-1">
        {fetchingTasks ? (
          <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600" /> Đang tải danh sách dịch vụ...
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((sr, index) => {
            const isSelected = selectedTask?.id === sr.id;
            const patientName = sr.patientName || 'Bệnh nhân';
            const phone = sr.patientPhone;
            const gender = sr.patientGender;
            const doctorName = sr.orderedByName || 'BS. Chuyên Khoa';
            const taskQueueNo = sr.task?.queueNumber || `TASK-#${sr.id}`;
            const isCompleted = activeTab === 'COMPLETED' || sr.status === 'COMPLETED' || sr.task?.status === 'COMPLETED';

            return (
              <div
                key={sr.id}
                onClick={() => setSelectedTask(sr)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  isSelected
                    ? isCompleted 
                      ? 'bg-emerald-50/90 border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-amber-50/90 border-amber-500 text-slate-900 shadow-sm ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-black text-white text-xs px-2 py-0.5 rounded-md shadow-sm ${
                      isCompleted ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded border ${
                      isCompleted 
                        ? 'text-emerald-900 bg-emerald-100 border-emerald-200' 
                        : 'text-amber-900 bg-amber-100 border-amber-200'
                    }`}>
                      {taskQueueNo}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {isCompleted ? 'HOÀN TẤT' : 'READY'}
                  </span>
                </div>

                {/* Patient Information Section */}
                <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <User className={`w-3.5 h-3.5 flex-shrink-0 ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`} />
                      <span>{patientName}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-amber-600' : ''}`} />
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

                  {/* If completed, show conclusion preview */}
                  {isCompleted && sr.result?.conclusion && (
                    <div className="mt-1 p-2 bg-emerald-50/80 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                      <strong>Kết luận:</strong> {sr.result.conclusion}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center text-slate-500 py-12 text-xs bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
            <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-medium text-slate-600">
              {activeTab === 'WAITING' 
                ? 'Không có task CLS nào ở trạng thái READY.' 
                : 'Chưa có lịch sử dịch vụ nào đã hoàn tất.'}
            </p>
            <p className="text-[11px] text-slate-500">
              {activeTab === 'WAITING'
                ? 'Bệnh nhân cần thanh toán hóa đơn ở Lễ tân để chuyển task sang READY.'
                : 'Các kỹ thuật viên sau khi trả kết quả thành công sẽ xuất hiện ở đây.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
