import React, { useState } from 'react';
import api from '../config/axios';
import { Printer, Loader2 } from 'lucide-react';

const PdfPrintButton = ({
  patientId,
  visitId,
  documentId,
  consultationId,
  prescriptionId,
  resultId,
  orderId,
  invoiceId,
  type = 'examination',
  endpoint: customEndpoint,
  label,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async (e) => {
    if (e) e.stopPropagation();
    if (!patientId || !visitId) {
      alert("Thiếu thông tin bệnh nhân hoặc lượt khám!");
      return;
    }

    setLoading(true);
    try {
      let targetEndpoint = customEndpoint;
      if (!targetEndpoint) {
        const targetDocId = documentId || consultationId || prescriptionId || resultId || orderId || invoiceId;
        switch (type) {
          case 'consultation':
            targetEndpoint = `/patients/${patientId}/visits/${visitId}/consultations/${targetDocId}/pdf`;
            break;
          case 'prescription':
            if (targetDocId && targetDocId !== 'undefined' && targetDocId !== 'null') {
              targetEndpoint = `/patients/${patientId}/visits/${visitId}/prescriptions/${targetDocId}/pdf`;
            } else {
              targetEndpoint = `/patients/${patientId}/visits/${visitId}/pdf/prescription`;
            }
            break;
          case 'serviceResult':
          case 'result':
            targetEndpoint = `/patients/${patientId}/visits/${visitId}/service-results/${targetDocId}/pdf`;
            break;
          case 'clinicalOrder':
          case 'order':
            targetEndpoint = `/patients/${patientId}/visits/${visitId}/clinical-orders/${targetDocId}/pdf`;
            break;
          case 'invoice':
            targetEndpoint = `/patients/${patientId}/visits/${visitId}/invoices/${targetDocId}/pdf`;
            break;
          case 'summary':
            targetEndpoint = `/patients/${patientId}/visits/${visitId}/pdf/summary`;
            break;
          case 'examination':
          default:
            targetEndpoint = `/patients/${patientId}/visits/${visitId}/pdf/examination`;
            break;
        }
      }

      const response = await api.get(targetEndpoint, {
        responseType: 'blob',
        withCredentials: true,
      });

      const blob = new Blob([response], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error fetching PDF:', error);
      alert('Không thể xuất file PDF. Vui lòng kiểm tra lại thông tin lượt khám!');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultLabel = () => {
    switch (type) {
      case 'consultation': return 'In Biên Bản Hội Chẩn';
      case 'prescription': return 'In Đơn Thuốc PDF';
      case 'serviceResult':
      case 'result': return 'In KQ Dịch Vụ / CLS';
      case 'clinicalOrder':
      case 'order': return 'In Phiếu Chỉ Định';
      case 'invoice': return 'In Hóa Đơn Thanh Toán';
      case 'summary': return 'In Tổng Hợp Đợt Khám';
      case 'examination':
      default: return 'In Phiếu Khám Bệnh';
    }
  };

  const baseStyles = 'inline-flex items-center gap-1.5 font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer';
  const sizeStyles = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs';
  const variantStyles = variant === 'secondary'
    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
    : variant === 'emerald'
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
    : variant === 'indigo'
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
    : variant === 'amber'
    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200';

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
      <span>{label || getDefaultLabel()}</span>
    </button>
  );
};

export default PdfPrintButton;

