import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { ClinicPartnerLayout } from '../layouts/clinic_partner/ClinicPartnerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { OutpatientLayout } from '../layouts/OutpatientLayout';

import { HomePage } from '../pages/patient/HomePage';
import { ClinicSearchPage } from '../pages/patient/ClinicSearchPage';
import { AppointmentBookingPage } from '../pages/patient/AppointmentBookingPage';
import { PatientProfilesPage } from '../pages/patient/PatientProfilesPage';
import { AiSuggestPage } from '../pages/patient/AiSuggestPage';
import { AppointmentHistoryPage } from '../pages/patient/AppointmentHistoryPage';
import { VNPayCallbackPage } from '../pages/patient/VNPayCallbackPage';
import PatientJourneyTrackerPage from '../pages/patient/PatientJourneyTrackerPage';
import ReceptionistCheckInAndCashierPage from '../pages/receptionist/ReceptionistCheckInAndCashierPage';
import DoctorConsultationWorkspace from '../pages/doctor/DoctorConsultationWorkspace';
import TechnicianTaskQueuePage from '../pages/technician/TechnicianTaskQueuePage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

import { ClinicProfilePage } from '../pages/clinic_partner/ClinicProfilePage';
import { ClinicSpecialtiesPage } from '../pages/clinic_partner/ClinicSpecialtiesPage';
import { DoctorListPage } from '../pages/clinic_partner/DoctorListPage';
import { DoctorSchedulePage } from '../pages/clinic_partner/DoctorSchedulePage';
import { AppointmentListPage } from '../pages/clinic_partner/AppointmentListPage';
import { AppointmentDetailPage } from '../pages/clinic_partner/AppointmentDetailPage';

import { ROLES } from '../config/constants';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Patient Portal Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
          <Route path="/patients" element={<PatientProfilesPage />} />
          <Route path="/history" element={<AppointmentHistoryPage />} />
          <Route path="/clinics" element={<ClinicSearchPage />} />
          <Route path="/booking" element={<AppointmentBookingPage />} />
          <Route path="/ai-suggest" element={<AiSuggestPage />} />
          <Route path="/outpatient/journey/:visitId" element={<PatientJourneyTrackerPage />} />
          <Route path="/outpatient/journey/appointment/:appointmentId" element={<PatientJourneyTrackerPage />} />
        </Route>
        <Route path="/payment/vnpay-callback" element={<VNPayCallbackPage />} />
      </Route>

      {/* Outpatient Portal Staff Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.CLINIC_ADMIN, ROLES.CLINIC_PARTNER, ROLES.ADMIN]} />}>
        <Route element={<OutpatientLayout />}>
          <Route path="/outpatient/receptionist" element={<ReceptionistCheckInAndCashierPage />} />
        </Route>
      </Route>

      <Route path="/outpatient/assistant" element={<Navigate to="/outpatient/doctor" replace />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR, ROLES.CLINIC_ADMIN, ROLES.ADMIN]} />}>
        <Route element={<OutpatientLayout />}>
          <Route path="/outpatient/doctor" element={<DoctorConsultationWorkspace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.TECHNICIAN, ROLES.CLINIC_ADMIN, ROLES.ADMIN]} />}>
        <Route element={<OutpatientLayout />}>
          <Route path="/outpatient/technician" element={<TechnicianTaskQueuePage />} />
        </Route>
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>

      {/* Dedicated Clinic Partner Portal Routes (CLINIC_PARTNER / CLINIC_STAFF) */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLINIC_PARTNER, ROLES.CLINIC_STAFF]} />}>
        <Route element={<ClinicPartnerLayout />}>
          <Route path="/clinic-partner" element={<Navigate to="/clinic-partner/profile" replace />} />
          <Route path="/clinic-partner/profile" element={<ClinicProfilePage />} />
          <Route path="/clinic-partner/specialties" element={<ClinicSpecialtiesPage />} />
          <Route path="/clinic-partner/doctors" element={<DoctorListPage />} />
          <Route path="/clinic-partner/slots" element={<DoctorSchedulePage />} />
          <Route path="/clinic-partner/appointments" element={<AppointmentListPage />} />
          <Route path="/clinic-partner/appointments/:id" element={<AppointmentDetailPage />} />
        </Route>
      </Route>

      {/* Legacy Clinic Partner Routes Redirect */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLINIC_PARTNER, ROLES.CLINIC_STAFF]} />}>
        <Route path="/clinic" element={<Navigate to="/clinic-partner/profile" replace />} />
        <Route path="/clinic/dashboard" element={<Navigate to="/clinic-partner/profile" replace />} />
        <Route path="/clinic/schedule" element={<Navigate to="/clinic-partner/slots" replace />} />
        <Route path="/clinic/appointments" element={<Navigate to="/clinic-partner/appointments" replace />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminDashboardPage />} />
          <Route path="/admin/clinics" element={<AdminDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
