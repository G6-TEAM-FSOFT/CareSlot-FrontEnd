import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { ClinicLayout } from '../layouts/ClinicLayout';
import { ClinicPartnerLayout } from '../layouts/clinic_partner/ClinicPartnerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';

import { HomePage } from '../pages/patient/HomePage';
import { ClinicSearchPage } from '../pages/patient/ClinicSearchPage';
import { AiSuggestPage } from '../pages/patient/AiSuggestPage';
import { AppointmentHistoryPage } from '../pages/patient/AppointmentHistoryPage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

import { ClinicDashboardPage } from '../pages/clinic/ClinicDashboardPage';
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
        <Route path="/clinics" element={<ClinicSearchPage />} />
        <Route path="/ai-suggest" element={<AiSuggestPage />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT, ROLES.CLINIC, ROLES.CLINIC_STAFF, ROLES.ADMIN]} />}>
          <Route path="/history" element={<AppointmentHistoryPage />} />
        </Route>
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>

      {/* Dedicated Clinic Partner Portal Routes (CLINIC_STAFF) */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLINIC_STAFF, ROLES.CLINIC, ROLES.ADMIN]} />}>
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
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLINIC, ROLES.CLINIC_STAFF, ROLES.ADMIN]} />}>
        <Route element={<ClinicLayout />}>
          <Route path="/clinic/dashboard" element={<ClinicDashboardPage />} />
          <Route path="/clinic/schedule" element={<ClinicDashboardPage />} />
          <Route path="/clinic/appointments" element={<ClinicDashboardPage />} />
        </Route>
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

