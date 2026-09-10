import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Shield, UserCheck, Stethoscope, FlaskConical, LogOut, 
  Hospital, Activity, ChevronRight, User
} from 'lucide-react';
import { ROLES } from '../config/constants';

export const OutpatientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ROLES.RECEPTIONIST: return 'Lễ Tân & Thu Ngân';
      case ROLES.CLINICAL_ASSISTANT: return 'Trợ Lý Y Tế';
      case ROLES.DOCTOR: return 'Bác Sĩ Chuyên Khoa';
      case ROLES.TECHNICIAN: return 'Kỹ Thuật Viên CLS';
      case ROLES.CLINIC_ADMIN: return 'Quản Lý Phòng Khám';
      case ROLES.ADMIN: return 'Administrator';
      default: return role || 'Nhân Viên';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.RECEPTIONIST: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case ROLES.CLINICAL_ASSISTANT: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case ROLES.DOCTOR: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case ROLES.TECHNICIAN: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const navItems = [
    { path: '/outpatient/receptionist', label: 'Lễ Tân & Thu Ngân', icon: Shield, roles: [ROLES.RECEPTIONIST, ROLES.CLINIC_ADMIN, ROLES.ADMIN, ROLES.CLINIC_PARTNER] },
    { path: '/outpatient/doctor', label: 'Bàn Khám Bác Sĩ', icon: Stethoscope, roles: [ROLES.DOCTOR, ROLES.CLINIC_ASSISTANT, ROLES.CLINIC_ADMIN, ROLES.ADMIN] },
    { path: '/outpatient/technician', label: 'Kỹ Thuật Viên CLS', icon: FlaskConical, roles: [ROLES.TECHNICIAN, ROLES.CLINIC_ADMIN, ROLES.ADMIN] },
  ];

  const visibleNavs = navItems.filter(item => 
    !user || !item.roles || item.roles.includes(user.role) || user.role === ROLES.ADMIN || user.role === ROLES.CLINIC_ADMIN
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform">
                  CS
                </div>
                <div>
                  <div className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                    CareSlot <span className="text-xs px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-mono border border-teal-200">v2 Clinical</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Quy trình Khám Ngoại Trú Khép Kín</div>
                </div>
              </Link>
            </div>

            {/* Quick Navigation Module Switcher (if multi-role or admin) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {visibleNavs.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      active 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile Pill & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                  {user?.fullName ? user.fullName.charAt(0) : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-900 leading-none mb-0.5">{user?.fullName || 'Người dùng'}</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${getRoleBadgeColor(user?.role)}`}>
                      {getRoleLabel(user?.role)}
                    </span>
                    <span className="text-[10px] text-slate-500">BV ĐHYHN</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-colors border border-slate-200 hover:border-rose-300"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-4 px-6 text-center">
        CareSlot Outpatient Workflow System © 2026 • Tuân thủ QĐ 1313/QĐ-BYT & Thông tư 32/2023/TT-BYT
      </footer>
    </div>
  );
};

