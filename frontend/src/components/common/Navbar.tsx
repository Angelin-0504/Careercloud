import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Cloud,
  Briefcase,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  Layers,
  GraduationCap,
  Building,
  ShieldCheck,
  FileText,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `text-xs font-semibold px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
      isActive(path)
        ? 'bg-indigo-50 text-indigo-700 font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                  CareerCloud
                </span>
                <span className="text-[10px] font-medium text-indigo-600 tracking-wider uppercase -mt-1">
                  Placement Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {!user && (
                <>
                  <Link to="/" className={linkClass('/')}>
                    Home
                  </Link>
                  <Link to="/explore-jobs" className={linkClass('/explore-jobs')}>
                    <Briefcase className="w-3.5 h-3.5" />
                    Explore Jobs
                  </Link>
                  <Link to="/architecture" className={linkClass('/architecture')}>
                    <Layers className="w-3.5 h-3.5" />
                    Cloud Architecture
                  </Link>
                </>
              )}

              {user?.role === 'student' && (
                <>
                  <Link to="/student/dashboard" className={linkClass('/student/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/explore-jobs" className={linkClass('/explore-jobs')}>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Find Jobs
                  </Link>
                  <Link to="/student/applications" className={linkClass('/student/applications')}>
                    <Briefcase className="w-3.5 h-3.5" />
                    My Applications
                  </Link>
                  <Link to="/student/saved" className={linkClass('/student/saved')}>
                    <Bookmark className="w-3.5 h-3.5" />
                    Shortlist
                  </Link>
                  <Link to="/student/profile" className={linkClass('/student/profile')}>
                    <GraduationCap className="w-3.5 h-3.5" />
                    Profile & Resume
                  </Link>
                </>
              )}

              {user?.role === 'recruiter' && (
                <>
                  <Link to="/recruiter/dashboard" className={linkClass('/recruiter/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/recruiter/post-job" className={linkClass('/recruiter/post-job')}>
                    + Post Job
                  </Link>
                  <Link to="/recruiter/jobs" className={linkClass('/recruiter/jobs')}>
                    <Briefcase className="w-3.5 h-3.5" />
                    Manage Jobs
                  </Link>
                  <Link to="/recruiter/applicants" className={linkClass('/recruiter/applicants')}>
                    <UserIcon className="w-3.5 h-3.5" />
                    Applicants
                  </Link>
                  <Link to="/recruiter/company" className={linkClass('/recruiter/company')}>
                    <Building className="w-3.5 h-3.5" />
                    Company Profile
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                    Overview
                  </Link>
                  <Link to="/admin/students" className={linkClass('/admin/students')}>
                    <GraduationCap className="w-3.5 h-3.5" />
                    Students Directory
                  </Link>
                  <Link to="/admin/recruiters" className={linkClass('/admin/recruiters')}>
                    <Building className="w-3.5 h-3.5" />
                    Companies
                  </Link>
                  <Link to="/admin/jobs" className={linkClass('/admin/jobs')}>
                    <Briefcase className="w-3.5 h-3.5" />
                    Job Moderation
                  </Link>
                  <Link to="/admin/audit-logs" className={linkClass('/admin/audit-logs')}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Audit Logs
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationDropdown />

                <div className="h-6 w-px bg-slate-200"></div>

                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 capitalize">
                      {user.role === 'admin' ? 'Placement Officer' : user.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register/student"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all hover:shadow"
                >
                  Student Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {!user && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Home
              </Link>
              <Link
                to="/explore-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Explore Jobs
              </Link>
              <Link
                to="/architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Cloud Architecture
              </Link>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg"
                >
                  Student Sign Up
                </Link>
              </div>
            </>
          )}

          {user?.role === 'student' && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/explore-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Find Jobs
              </Link>
              <Link
                to="/student/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                My Applications
              </Link>
              <Link
                to="/student/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Shortlist
              </Link>
              <Link
                to="/student/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Profile & Resume
              </Link>
            </>
          )}

          {user?.role === 'recruiter' && (
            <>
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/recruiter/post-job"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                + Post Job
              </Link>
              <Link
                to="/recruiter/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Manage Jobs
              </Link>
              <Link
                to="/recruiter/applicants"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Applicants
              </Link>
              <Link
                to="/recruiter/company"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Company Profile
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Overview
              </Link>
              <Link
                to="/admin/students"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Students Directory
              </Link>
              <Link
                to="/admin/recruiters"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Companies
              </Link>
              <Link
                to="/admin/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Job Moderation
              </Link>
              <Link
                to="/admin/audit-logs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Audit Logs
              </Link>
            </>
          )}

          {user && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
                <div className="text-[10px] text-slate-500">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
