import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Building2, CalendarDays, FileText, Info, Plus, RefreshCw } from 'lucide-react';
import { appointmentService, bookingService, clinicService } from '../../services/clinicService';
import { patientService } from '../../services/patientService';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { WeeklySlotTable } from '../../components/booking/WeeklySlotTable';
import { BookingSummary } from '../../components/booking/BookingSummary';
import { addDays, asList, ASSIGNMENT_NOTICE, dateKey, timeLabel, todayInVietnam, unwrapData } from '../../components/booking/bookingUtils';

const selectClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50';

export function AppointmentBookingPage() {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState(searchParams.get('clinicId') || '');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(searchParams.get('specialtyId') || '');
  const [symptomNote, setSymptomNote] = useState('');
  const [weekStart, setWeekStart] = useState(todayInVietnam);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [initialError, setInitialError] = useState('');
  const [clinicError, setClinicError] = useState('');
  const [slotsError, setSlotsError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [reload, setReload] = useState(0);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [paymentAppointment, setPaymentAppointment] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const pendingRequest = useRef(null);
  const inFlight = useRef(false);
  const today = todayInVietnam();

  useEffect(() => {
    let active = true;
    setInitialLoading(true);
    setInitialError('');
    const loadClinics = async () => {
      const first = unwrapData(await clinicService.getAllClinics({ size: 100 }));
      const all = asList(first);
      for (let page = 1; page < (first?.totalPages || 1); page += 1) {
        all.push(...asList(await clinicService.getAllClinics({ size: 100, page })));
      }
      return all;
    };
    Promise.all([patientService.getPatients(), loadClinics()]).then(([profiles, clinicList]) => {
      if (!active) return;
      const profileList = asList(profiles);
      setPatients(profileList);
      setSelectedPatientId((previous) => previous || String(profileList[0]?.id || ''));
      setClinics(clinicList);
    }).catch((error) => {
      if (active) setInitialError(error?.message || 'Không tải được thông tin đặt khám. Vui lòng thử lại.');
    }).finally(() => { if (active) setInitialLoading(false); });
    return () => { active = false; };
  }, [reload]);

  useEffect(() => {
    let active = true;
    setClinic(null);
    setClinicError('');
    if (!selectedClinicId) { setClinicLoading(false); return; }
    setClinicLoading(true);
    clinicService.getClinicById(selectedClinicId).then((response) => {
      if (!active) return;
      const detail = unwrapData(response);
      setClinic(detail);
      setSelectedSpecialtyId((previous) => detail.specialties?.some((item) => String(item.id) === String(previous)) ? previous : '');
    }).catch((error) => {
      if (active) setClinicError(error?.message || 'Không tải được chuyên khoa của cơ sở.');
    }).finally(() => { if (active) setClinicLoading(false); });
    return () => { active = false; };
  }, [selectedClinicId, reload]);

  const specialties = clinic?.specialties || [];
  const activeSpecialty = specialties.find((item) => String(item.id) === String(selectedSpecialtyId));
  const ready = !!(clinic && activeSpecialty && !clinicLoading);

  useEffect(() => {
    let active = true;
    setSelectedSlot(null);
    setSlots([]);
    setSlotsError('');
    if (!ready) { setSlotsLoading(false); return; }
    setSlotsLoading(true);
    bookingService.getAvailability({ clinicId: selectedClinicId, specialtyId: selectedSpecialtyId, fromDate: weekStart, toDate: addDays(weekStart, 6) }).then((response) => {
      if (active) setSlots(asList(response));
    }).catch((error) => {
      if (active) setSlotsError(error?.message || 'Không tải được lịch trống. Vui lòng thử lại.');
    }).finally(() => { if (active) setSlotsLoading(false); });
    return () => { active = false; };
  }, [ready, selectedClinicId, selectedSpecialtyId, weekStart, availabilityVersion]);

  const handleBook = async () => {
    if (!selectedSlot || !selectedPatientId || !ready || inFlight.current) return;
    const payload = {
      patientProfileId: Number(selectedPatientId), clinicId: Number(selectedClinicId), specialtyId: Number(selectedSpecialtyId),
      appointmentDate: dateKey(selectedSlot.appointmentDate), startTime: timeLabel(selectedSlot.startTime), endTime: timeLabel(selectedSlot.endTime),
      symptomNote: symptomNote.trim() || null,
    };
    const fingerprint = JSON.stringify(payload);
    if (pendingRequest.current?.fingerprint !== fingerprint) {
      pendingRequest.current = { fingerprint, requestKey: crypto.randomUUID() };
    }
    inFlight.current = true;
    setSubmitting(true);
    setBookingError('');
    try {
      const appointment = unwrapData(await appointmentService.createAppointment({ ...payload, requestKey: pendingRequest.current.requestKey }));
      setPaymentAppointment(appointment);
      setShowPayment(true);
      pendingRequest.current = null;
      setSelectedSlot(null);
      setAvailabilityVersion((value) => value + 1);
    } catch (error) {
      setBookingError(error?.message || 'Chưa thể giữ khung giờ. Vui lòng thử lại.');
      // Keep the request key on ambiguous network errors so retries cannot create duplicate bookings.
      if (/SLOT|AVAILABLE|CONFLICT|EXPIRED/.test(String(error?.code || ''))) {
        pendingRequest.current = null;
        setSelectedSlot(null);
        setAvailabilityVersion((value) => value + 1);
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const resetSelection = () => { setSelectedSlot(null); setBookingError(''); };

  return <div className="min-h-screen bg-slate-50 py-7 text-slate-800">
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 px-6 py-6 text-white shadow-sm">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-100"><CalendarDays className="h-4 w-4" /> Đặt hẹn cùng CareSlot</p>
        <h1 className="text-2xl font-extrabold">Đặt lịch khám</h1>
        <p className="mt-2 text-sm text-indigo-100">Chọn người khám và khung giờ phù hợp tại cơ sở bạn tin chọn.</p>
      </div>
      {initialError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{initialError}</span><button type="button" onClick={() => setReload((value) => value + 1)} className="inline-flex items-center gap-1 font-bold"><RefreshCw className="h-4 w-4" /> Thử lại</button></div>}
      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 border-b border-slate-100 pb-4 font-bold text-slate-900"><FileText className="h-5 w-5 text-indigo-600" /> Thông tin đặt khám</h2>
            <div className="space-y-2"><label htmlFor="booking-patient" className="text-xs font-semibold text-slate-600">Người tới khám <span className="text-rose-500">*</span></label>
              <select id="booking-patient" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)} disabled={submitting || initialLoading} className={selectClass}>
                {!patients.length && <option value="">{initialLoading ? 'Đang tải hồ sơ…' : 'Chưa có hồ sơ người khám'}</option>}
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}
              </select>
              <Link to="/patients" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"><Plus className="h-3.5 w-3.5" /> Quản lý / Thêm hồ sơ</Link>
            </div>
            <div className="space-y-2"><label htmlFor="booking-clinic" className="text-xs font-semibold text-slate-600">Cơ sở khám <span className="text-rose-500">*</span></label>
              <select id="booking-clinic" value={selectedClinicId} onChange={(event) => { resetSelection(); setSelectedClinicId(event.target.value); setSelectedSpecialtyId(''); }} disabled={submitting || initialLoading} className={selectClass}>
                <option value="">Chọn cơ sở khám</option>{clinics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              {clinic?.address && <p className="flex items-start gap-1 text-[11px] leading-relaxed text-slate-500"><Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{clinic.address}</p>}
            </div>
            <div className="space-y-2"><label htmlFor="booking-specialty" className="text-xs font-semibold text-slate-600">Chuyên khoa <span className="text-rose-500">*</span></label>
              <select id="booking-specialty" value={selectedSpecialtyId} onChange={(event) => { resetSelection(); setSelectedSpecialtyId(event.target.value); }} disabled={submitting || clinicLoading || !clinic} className={selectClass}>
                <option value="">{clinicLoading ? 'Đang tải chuyên khoa…' : 'Chọn chuyên khoa'}</option>{specialties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              {clinicError && <div role="alert" className="text-xs text-rose-600">{clinicError} <button type="button" onClick={() => setReload((value) => value + 1)} className="font-bold underline">Thử lại</button></div>}
            </div>
            <div className="space-y-2"><label htmlFor="booking-symptom" className="text-xs font-semibold text-slate-600">Lý do khám <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
              <textarea id="booking-symptom" rows={3} maxLength={1000} value={symptomNote} disabled={submitting} onChange={(event) => setSymptomNote(event.target.value)} className={`${selectClass} resize-none`} placeholder="Mô tả ngắn triệu chứng hoặc nhu cầu khám…" />
            </div>
          </section>
          <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs leading-relaxed text-indigo-800"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>{ASSIGNMENT_NOTICE}</p></div>
        </aside>
        <main className="min-w-0 space-y-5">
          {paymentAppointment && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900"><p>Đã tạo yêu cầu đặt khám <strong>{paymentAppointment.bookingCode}</strong>. Xem trạng thái hoặc tiếp tục thanh toán.</p><div className="flex gap-3"><button type="button" onClick={() => setShowPayment(true)} className="font-bold text-indigo-700 underline">Thanh toán</button><Link to="/history" className="font-semibold underline">Lịch đã đặt</Link></div></div>}
          <WeeklySlotTable weekStart={weekStart} today={today} slots={slots} selectedSlot={selectedSlot} onSelect={(slot) => { setSelectedSlot(slot); setBookingError(''); }} onChangeWeek={(date) => { resetSelection(); setWeekStart(date < today ? today : date); }} loading={slotsLoading} error={slotsError} onRetry={() => setAvailabilityVersion((value) => value + 1)} ready={ready} disabled={submitting} />
          {bookingError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{bookingError}</div>}
          <BookingSummary patient={patients.find((item) => String(item.id) === String(selectedPatientId))} clinic={clinic} specialty={activeSpecialty} slot={selectedSlot} submitting={submitting} disabled={!selectedPatientId || !selectedSlot || !ready || slotsLoading || !!initialError} onSubmit={handleBook} />
        </main>
      </div>
    </div>
    <PaymentModal isOpen={showPayment} onClose={() => { setShowPayment(false); setAvailabilityVersion((value) => value + 1); }} appointment={paymentAppointment} />
  </div>;
}
