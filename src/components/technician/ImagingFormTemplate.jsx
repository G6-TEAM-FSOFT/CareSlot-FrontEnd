import React from 'react';
import { Camera } from 'lucide-react';

export default function ImagingFormTemplate({
  imaging,
  handleImagingChange,
  setImaging,
  buildImagingPayload
}) {
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-600" />
          Thông Số Chẩn Đoán Hình Ảnh (Siêu Âm / Chụp CT Scanner / X-Quang)
        </h3>

        {/* Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => {
              const normal = {
                serviceType: 'ULTRASOUND',
                organ: 'Ổ bụng tổng quát',
                findingStatus: 'Bình thường',
                observation: 'Gan, mật, tụy, lách, hai thận kích thước và cấu trúc nhu mô bình thường. Không thấy dịch tự do ổ bụng.',
                recommendation: 'Không phát hiện bất thường trên siêu âm.'
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
                recommendation: 'Theo dõi viêm niêm mạc dạ dày - tá tràng.'
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
                observation: 'Nhu mô brain/phổi hai bên sáng đều, không thấy tổn thương đè đẩy hay tụ máu bất thường. Các khe khớp nguyên vẹn.',
                recommendation: 'Hình ảnh CT Scanner trong giới hạn bình thường.'
              };
              setImaging(ctNormal);
              buildImagingPayload(ctNormal);
            }}
            className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold rounded-lg border border-sky-300 transition"
          >
            Mẫu CT Scanner Bình Thường
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        
        {/* Organ / Body Region */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <label className="font-extrabold text-slate-800 block">Vị Trí / Cơ Quan Thăm Khám</label>
          <select
            value={imaging.organ}
            onChange={e => handleImagingChange('organ', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-amber-500 outline-none"
          >
            <option value="Ổ bụng tổng quát">Ổ bụng tổng quát</option>
            <option value="Dạ dày & Tá tràng">Dạ dày & Tá tràng (Tiêu hóa)</option>
            <option value="Gan - Mật - Tụy">Gan - Mật - Tụy</option>
            <option value="Tim & Mạch máu">Tim & Mạch máu (Doppler)</option>
            <option value="Lồng ngực & Phổi">Lồng ngực & Phổi</option>
            <option value="Sọ não & Đầu mặt cổ">Sọ não & Đầu mặt cổ</option>
            <option value="Cột sống & Xương khớp">Cột sống & Xương khớp</option>
          </select>
        </div>

        {/* Finding Status */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <label className="font-extrabold text-slate-800 block">Đánh Giá Tình Trạng / Mức Độ</label>
          <select
            value={imaging.findingStatus}
            onChange={e => handleImagingChange('findingStatus', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:border-amber-500 outline-none"
          >
            <option value="Bình thường">Bình thường (In Normal Range)</option>
            <option value="Viêm xung huyết nhẹ">Viêm xung huyết nhẹ</option>
            <option value="Có tổn thương nghi ngờ">Có tổn thương nghi ngờ</option>
            <option value="Cần theo dõi chuyên khoa">Cần theo dõi chuyên khoa</option>
          </select>
        </div>

        {/* Observation Detail */}
        <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <label className="font-extrabold text-slate-800 block">Mô Tả Chi Tiết Hình Ảnh Ghi Nhận</label>
          <textarea
            rows={3}
            value={imaging.observation}
            onChange={e => handleImagingChange('observation', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:border-amber-500 outline-none text-xs"
            placeholder="Nhập chi tiết mô tả hình ảnh siêu âm hoặc CT Scanner..."
          />
        </div>

        {/* Technical Recommendation */}
        <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
          <label className="font-extrabold text-slate-800 block">Đề Xuất Y Khoa Kỹ Thuật</label>
          <input
            type="text"
            value={imaging.recommendation}
            onChange={e => handleImagingChange('recommendation', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium focus:border-amber-500 outline-none text-xs"
            placeholder="Nhập đề xuất hoặc dặn dò..."
          />
        </div>

      </div>
    </div>
  );
}
