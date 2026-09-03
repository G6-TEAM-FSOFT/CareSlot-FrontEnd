import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { ClinicLayout } from '../layouts/ClinicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';

import { HomePage } from '../pages/patient/HomePage';
import { ClinicSearchPage } from '../pages/patient/ClinicSearchPage';
import { AiSuggestPage } from '../pages/patient/AiSuggestPage';
import { AppointmentHistoryPage } from '../pages/patient/AppointmentHistoryPage';
import { PatientProfilePage } from '../pages/patient/PatientProfilePage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

import { ClinicDashboardPage } from '../pages/clinic/ClinicDashboardPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

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

        <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
          <Route path="/patient/profile" element={<PatientProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT, ROLES.CLINIC, ROLES.ADMIN]} />}>
          <Route path="/history" element={<AppointmentHistoryPage />} />
        </Route>
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>

      {/* Clinic Partner Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.CLINIC, ROLES.ADMIN]} />}>
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
