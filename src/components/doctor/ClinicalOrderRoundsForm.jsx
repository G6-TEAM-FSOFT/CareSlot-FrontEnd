import React from 'react';
import { FilePlus, PlusCircle, Lock, Send, AlertCircle, CheckSquare, Square } from 'lucide-react';

export default function ClinicalOrderRoundsForm({
  visit,
  loading,
  isVitalAndHistorySaved,
  showRound2Form,
  setShowRound2Form,
  selectedServiceIds,
  setSelectedServiceIds,
  catalog,
  handleCreateOrder,
  renderDiagnosticResultDetails
}) {
  if (!visit || visit.status === 'COMPLETED') return null;

  return (
    <div className="space-y-4">

      {/* Render Issued Clinical Orders (Order Round 1, Round 2...) */}
      {visit.clinicalOrders && visit.clinicalOrders.length > 0 && (
        <div className="space-y-4">
          {visit.clinicalOrders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-2xl border border-indigo-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FilePlus className="w-4 h-4 text-indigo-600" />
                    Lệnh Chỉ Định - Order Round {order.orderRound} ({order.orderCode})
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    BS chỉ định: <strong className="text-slate-800">{order.orderedByName}</strong>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  }`}>
                  {order.status === 'COMPLETED' ? 'HOÀN TẤT (ĐÃ CÓ ĐỦ KQ)' : 'ĐANG THỰC HIỆN'}
                </span>
              </div>

              {/* Services ordered in this round */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Các dịch vụ cận lâm sàng đã chọn trong Round {order.orderRound}:</div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {order.serviceRequests.map(sr => (
                    <div key={sr.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center font-bold text-slate-900">
                        <span>{sr.serviceName}</span>
                        <span className="font-mono text-emerald-700">{sr.price ? sr.price.toLocaleString('vi-VN') : 0} VNĐ</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>Mã DV: <strong className="font-mono">{sr.serviceCode}</strong></span>
                        <span className={`font-bold px-1.5 py-0.5 rounded border ${sr.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          sr.task?.status === 'READY' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                          {sr.status === 'COMPLETED' ? 'Đã có kết quả' : sr.task?.status === 'READY' ? 'Đã thanh toán (Chờ KTV)' : 'Chờ thanh toán'}
                        </span>
                      </div>

                      {/* Diagnostic result returned from KTV */}
                      {/* {sr.result ? (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-xs bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                          <div className="font-bold text-emerald-800 text-[11px] flex items-center justify-between">
                            <span>✓ KQ từ KTV ({sr.result.enteredByName}):</span>
                            <span className="text-[10px] font-normal text-slate-500">{sr.result.finalizedAt ? new Date(sr.result.finalizedAt).toLocaleTimeString('vi-VN') : ''}</span>
                          </div>
                          {renderDiagnosticResultDetails(sr.result)}
                        </div>
                      ) : (
                        <div className="mt-1 text-[11px] text-amber-700 font-medium italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                          ⏳ Đang chờ KTV phòng {sr.task?.roomName || 'Cận lâm sàng'} nhập kết quả...
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Button to trigger Order Round 2 creation if Order Round 1 exists and Order Round 2 form is not open */}
      {visit.clinicalOrders && visit.clinicalOrders.length > 0 && !showRound2Form && (
        <div className="flex items-center justify-between bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200">
          <button
            type="button"
            onClick={() => setShowRound2Form(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 flex-shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            + Tạo Lệnh Chỉ Định Vòng 2 (Order Round 2)
          </button>
        </div>
      )}

      {/* Order Selection Form: Shown when NO orders exist (Round 1) OR when showRound2Form is true (Round 2+) */}
      {(visit.clinicalOrders?.length === 0 || showRound2Form) && (
        <div className={`p-5 rounded-2xl border transition-all ${isVitalAndHistorySaved
          ? 'bg-slate-50 border-slate-200 space-y-4 shadow-sm'
          : 'bg-slate-100/80 border-slate-300 space-y-4 opacity-80'
          }`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-indigo-600" />
                2. Chỉ Định Cận Lâm Sàng (Order Round {(visit.clinicalOrders?.length || 0) + 1})
                {!isVitalAndHistorySaved && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" /> CHƯA KÍCH HOẠT
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Chọn các xét nghiệm/chẩn đoán hình ảnh cần thực hiện cho bệnh nhân</p>
            </div>

            <div className="flex items-center gap-2">
              {showRound2Form && (
                <button
                  type="button"
                  onClick={() => setShowRound2Form(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Hủy
                </button>
              )}
              <button
                type="button"
                disabled={loading || selectedServiceIds.length === 0 || !isVitalAndHistorySaved}
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-xs rounded-xl shadow-sm active:scale-95 flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Xác Nhận & Gửi Lệnh Chỉ Định Round {(visit.clinicalOrders?.length || 0) + 1} ({selectedServiceIds.length})
              </button>
            </div>
          </div>

          {!isVitalAndHistorySaved && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2.5 font-medium shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Vui lòng hoàn tất và nhấn <strong>"Lưu Sinh Tồn & Bệnh Sử"</strong> ở Bước 1 trước để KÍCH HOẠT bước Chỉ Định Cận Lâm Sàng.</span>
            </div>
          )}

          {catalog.length > 0 ? (
            <div className={`grid sm:grid-cols-2 gap-3 text-xs ${!isVitalAndHistorySaved ? 'pointer-events-none opacity-50' : ''}`}>
              {catalog.map(item => {
                const isSelected = selectedServiceIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isVitalAndHistorySaved) return;
                      if (isSelected) setSelectedServiceIds(selectedServiceIds.filter(id => id !== item.id));
                      else setSelectedServiceIds([...selectedServiceIds, item.id]);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-slate-900 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
                        }`}>
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-500">Mã DV: <strong className="font-mono text-slate-700">{item.code}</strong> • Loại: {item.serviceType}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs ml-2 flex-shrink-0">
                      {item.price ? item.price.toLocaleString('vi-VN') : 0} VNĐ
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-6 text-xs bg-white rounded-xl border border-slate-200 shadow-sm">
              Chưa lấy được danh mục dịch vụ từ Backend API.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
