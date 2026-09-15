import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, Image as ImageIcon, Loader2, Eye, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fileService } from '../../services/fileService';

export default function ImagingFormTemplate({
  imaging,
  handleImagingChange,
  setImaging,
  buildImagingPayload,
  disabled = false
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const fileInputRef = useRef(null);

  const imageUrls = imaging.imageUrls || [];

  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    try {
      const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setUploadError('Vui lòng chỉ chọn các tệp định dạng hình ảnh (PNG, JPG, JPEG, WEBP).');
        setUploading(false);
        return;
      }

      const uploadedResults = await fileService.uploadMultipleFiles(validFiles, 'diagnostics');
      const newUrls = uploadedResults.map(res => res.url || res);

      const updatedUrls = [...imageUrls, ...newUrls];
      const updatedImaging = { ...imaging, imageUrls: updatedUrls };
      setImaging(updatedImaging);
      buildImagingPayload(updatedImaging);
    } catch (err) {
      console.error('Lỗi khi tải ảnh chẩn đoán:', err);
      setUploadError(err.response?.data?.message || err.message || 'Không thể tải ảnh lên AWS S3. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const fileUrlToRemove = imageUrls[indexToRemove];
    const updatedUrls = imageUrls.filter((_, idx) => idx !== indexToRemove);
    const updatedImaging = { ...imaging, imageUrls: updatedUrls };
    setImaging(updatedImaging);
    buildImagingPayload(updatedImaging);

    if (fileUrlToRemove) {
      try {
        await fileService.deleteFile(fileUrlToRemove);
      } catch (err) {
        console.warn('Không thể xóa ảnh trên S3:', err);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-600" />
          Thông Số Chẩn Đoán Hình Ảnh (Siêu Âm / Chụp CT Scanner / X-Quang)
        </h3>

        {/* Sample Presets */}
        {!disabled && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                const normal = {
                  serviceType: 'ULTRASOUND',
                  organ: 'Ổ bụng tổng quát',
                  findingStatus: 'Bình thường',
                  observation: 'Gan, mật, tụy, lách, hai thận kích thước và cấu trúc nhu mô bình thường. Không thấy dịch tự do ổ bụng.',
                  recommendation: 'Không phát hiện bất thường trên siêu âm.',
                  imageUrls: imaging.imageUrls || []
                };
                setImaging(normal);
                buildImagingPayload(normal);
              }}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg border border-emerald-300 transition"
            >
              Mẫu Siêu Âm Bình Thường
            </button>

            <button
              type="button"
              onClick={() => {
                const gastro = {
                  serviceType: 'ULTRASOUND',
                  organ: 'Dạ dày & Tá tràng',
                  findingStatus: 'Viêm xung huyết niêm mạc',
                  observation: 'Niêm mạc vùng hang vị dạ dày dày nhẹ, xung huyết rải rác. Thành dạ dày co bóp đều, không thấy u cục hay dịch tụ bất thường.',
                  recommendation: 'Theo dõi viêm niêm mạc dạ dày - tá tràng.',
                  imageUrls: imaging.imageUrls || []
                };
                setImaging(gastro);
                buildImagingPayload(gastro);
              }}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg border border-amber-300 transition"
            >
              Mẫu Siêu Âm Dạ Dày
            </button>

            <button
              type="button"
              onClick={() => {
                const ctNormal = {
                  serviceType: 'CT_SCAN',
                  organ: 'Sọ não / Lồng ngực',
                  findingStatus: 'Bình thường',
                  observation: 'Nhu mô não/phổi hai bên sáng đều, không thấy tổn thương đè đẩy hay tụ máu bất thường. Các khe khớp nguyên vẹn.',
                  recommendation: 'Hình ảnh CT Scanner trong giới hạn bình thường.',
                  imageUrls: imaging.imageUrls || []
                };
                setImaging(ctNormal);
                buildImagingPayload(ctNormal);
              }}
              className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-lg border border-sky-300 transition"
            >
              Mẫu CT Scanner Bình Thường
            </button>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        {/* Service Type Selection */}
        <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
          <label className="font-extrabold text-slate-700 block">Loại hình chẩn đoán:</label>
          <select
            disabled={disabled}
            value={imaging.serviceType || 'ULTRASOUND'}
            onChange={e => handleImagingChange('serviceType', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-600"
          >
            <option value="ULTRASOUND">Siêu Âm Màu 3D/4D (Ultrasound)</option>
            <option value="CT_SCAN">Chụp Cắt Lớp Vi Tính (CT-Scanner)</option>
            <option value="X_RAY">Chụp X-Quang Kỹ Thuật Số (Digital X-Ray)</option>
            <option value="MRI">Chụp Cộng Hưởng Từ (MRI)</option>
            <option value="ENDOSCOPY">Nội Soi Tiêu Hóa (Endoscopy)</option>
          </select>
        </div>

        {/* Target Organ / Body Part */}
        <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
          <label className="font-extrabold text-slate-700 block">Vị trí / Bộ phận thăm khám:</label>
          <input
            type="text"
            disabled={disabled}
            value={imaging.organ || ''}
            onChange={e => handleImagingChange('organ', e.target.value)}
            placeholder="Ví dụ: Ổ bụng tổng quát, Phổi thẳng, Cột sống thắt lưng..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-600"
          />
        </div>

        {/* Overall Status Finding */}
        <div className="sm:col-span-2 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
          <label className="font-extrabold text-slate-700 block">Đánh giá chung (Finding Status):</label>
          <select
            disabled={disabled}
            value={imaging.findingStatus || 'Bình thường'}
            onChange={e => handleImagingChange('findingStatus', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-600"
          >
            <option value="Bình thường">Hình ảnh bình thường, chưa phát hiện bất thường</option>
            <option value="Bất thường nhẹ">Bất thường nhẹ (Cần theo dõi hoặc kiểm tra thêm)</option>
            <option value="Bất thường rõ">Có tổn thương / Bất thường rõ ràng (Cần can thiệp bác sĩ chuyên khoa)</option>
            <option value="Cấp cứu">Tổn thương nghiêm trọng / Cần xử trí khẩn cấp</option>
          </select>
        </div>

        {/* Detailed Image Observations */}
        <div className="sm:col-span-2 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
          <label className="font-extrabold text-slate-700 block">Mô tả hình ảnh chi tiết (Observation):</label>
          <textarea
            rows={3}
            disabled={disabled}
            value={imaging.observation || ''}
            onChange={e => handleImagingChange('observation', e.target.value)}
            placeholder="Nhập chi tiết mô tả tổn thương, kích thước, cấu trúc nhu mô..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-900 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-600"
          />
        </div>

        {/* Recommendation / Doctor Advice */}
        <div className="sm:col-span-2 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
          <label className="font-extrabold text-slate-700 block">Đề xuất / Kế hoạch tiếp theo:</label>
          <input
            type="text"
            disabled={disabled}
            value={imaging.recommendation || ''}
            onChange={e => handleImagingChange('recommendation', e.target.value)}
            placeholder="Nhập đề xuất hoặc dặn dò..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-600"
          />
        </div>

        {/* Diagnostic Images Section */}
        <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              Hình Ảnh Siêu Âm / Phim CT / X-Quang ({imageUrls.length} ảnh)
            </label>
            <span className="text-[11px] text-slate-500">Lưu trữ trên AWS S3</span>
          </div>

          {/* Upload Dropzone (Only shown if not disabled) */}
          {!disabled && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFilesUpload(e.target.files)}
              />

              {uploading ? (
                <div className="flex items-center gap-2 text-indigo-700 py-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-bold text-xs">Đang tải ảnh lên AWS S3...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-xs">
                      Kéo thả ảnh vào đây, hoặc <span className="text-indigo-600 underline">bấm để chọn file từ máy</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hỗ trợ định dạng PNG, JPG, JPEG, WEBP. Cho phép chọn nhiều ảnh cùng lúc.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error alert */}
          {uploadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Uploaded Images Preview Grid */}
          {imageUrls.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Danh Sách Ảnh Chẩn Đoán Đính Kèm ({imageUrls.length} ảnh):
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold">Bấm vào ảnh để xem phóng to</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer"
                    onClick={() => setPreviewModalUrl(url)}
                  >
                    <img
                      src={url}
                      alt={`Ảnh chẩn đoán ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Image index badge */}
                    <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalUrl(url);
                        }}
                        title="Xem phóng to"
                        className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-sm transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          title="Xóa ảnh này"
                          className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox / Preview Modal for Technician */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-800 text-white flex justify-between items-center text-xs font-bold border-b border-slate-700">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Xem Ảnh Chẩn Đoán Hình Ảnh (Độ Phân Giải Gốc)
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/90 overflow-auto">
              <img
                src={previewModalUrl}
                alt="Chẩn đoán hình ảnh gốc"
                className="max-h-[80vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
