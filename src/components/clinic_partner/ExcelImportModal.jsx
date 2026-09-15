import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, AlertCircle, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { partnerSlotService } from '../../services/clinic_partner/partnerSlotService';

export const ExcelImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        !file.name.endsWith('.xlsx') &&
        !file.name.endsWith('.xls') &&
        file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setError('Vui lòng chọn file Excel có định dạng .xlsx hoặc .xls');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setResultData(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file Excel để tải lên');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setResultData(null);

      const res = await partnerSlotService.importExcelSchedule(selectedFile);
      const data = res.data || res;
      setResultData(data);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error('Failed to import Excel file', err);
      const msg = err.message || err.response?.data?.message || '';
      if (msg.includes('overlap') || msg.includes('3004')) {
        setError('⚠️ LỖI CHỒNG LẤN LỊCH (OVERLAPS): Một số ca khám trong file Excel bị trùng lấn thời gian với lịch đã có của Bác sĩ!');
      } else {
        setError(msg || 'Lỗi khi import file Excel lịch làm việc bác sĩ.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setResultData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Import Lịch làm việc bằng Excel</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="font-semibold leading-relaxed">{error}</div>
          </div>
        )}

        {/* Upload Box */}
        {!resultData ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-8 text-center bg-slate-50 transition">
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block space-y-3">
                <Upload className="w-10 h-10 text-cyan-600 mx-auto animate-bounce" />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Bấm để chọn hoặc kéo thả file Excel (.xlsx)'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    File mẫu chứa các cột: doctorId, appointmentDate (YYYY-MM-DD), startTime, endTime, roomName
                  </p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono font-semibold">{selectedFile.name}</span>
                  <span className="text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={handleReset} className="text-red-600 hover:underline text-[11px] font-semibold">
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Result Summary Box */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">Kết quả Xử lý File Excel</span>
                <span className="text-xs font-mono font-bold text-cyan-700">Total Rows: {resultData.totalRows || 0}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-semibold">Thành công</p>
                  <p className="text-2xl font-bold text-emerald-800">{resultData.successCount || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-xs text-red-700 font-semibold">Thất bại / Lỗi trùng</p>
                  <p className="text-2xl font-bold text-red-800">{resultData.failedCount || 0}</p>
                </div>
              </div>

              {/* Error Details List if any */}
              {resultData.errors && resultData.errors.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Chi tiết các dòng bị lỗi / trùng lịch:</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2 space-y-1 text-[11px]">
                    {resultData.errors.map((errItem, idx) => (
                      <div key={idx} className="text-red-700 font-mono">
                        • {errItem}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Đóng
          </button>
          {!resultData ? (
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Bắt đầu Upload Excel</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-md"
            >
              Import file khác
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
