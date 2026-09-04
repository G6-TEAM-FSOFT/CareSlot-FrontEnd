import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  Stethoscope,
  UserCheck,
  CalendarClock,
  ClipboardList,
  LogOut,
  Home,
  ShieldCheck,
  Hospital
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const ClinicPartnerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    {
      to: '/clinic-partner/profile',
      label: 'Thông tin Phòng khám',
      icon: Building2,
    },
    {
      to: '/clinic-partner/specialties',
      label: 'Quản lý Chuyên khoa',
      icon: Stethoscope,
    },
    {
      to: '/clinic-partner/doctors',
      label: 'Quản lý Bác sĩ',
      icon: UserCheck,
    },
    {
      to: '/clinic-partner/slots',
      label: 'Lịch khám & Slots (Excel)',
      icon: CalendarClock,
    },
    {
      to: '/clinic-partner/appointments',
      label: 'Danh sách Lịch hẹn',
      icon: ClipboardList,
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar - Clean Light Surface */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shadow-sm">
        <div>
          {/* Header Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-md shadow-cyan-500/20">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                CareSlot Partner
              </h1>
              <p className="text-xs text-cyan-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                CLINIC_STAFF Portal
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.fullName || user?.username || 'Clinic Staff'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'staff@clinic.com'}</p>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
