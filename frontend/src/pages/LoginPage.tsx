import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Cloud, Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles, GraduationCap, Building, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login({ email, password });
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (loggedUser.role === 'student') navigate('/student/dashboard');
        else if (loggedUser.role === 'recruiter') navigate('/recruiter/dashboard');
        else if (loggedUser.role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 items-center justify-center text-white shadow-md mb-2">
            <Cloud className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to CareerCloud
          </h2>
          <p className="text-xs text-slate-500">
            Access your cloud-based placement portal and recommendations
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Demo Accounts (1-Click Fill)
            </span>
            <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded font-mono">
              Password@123
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('alex.student@university.edu')}
              className="px-2 py-2 text-[11px] font-semibold text-slate-700 bg-white hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200/80 shadow-2xs transition-all flex flex-col items-center gap-1 text-center"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('sarah.recruiter@cloudscale.io')}
              className="px-2 py-2 text-[11px] font-semibold text-slate-700 bg-white hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200/80 shadow-2xs transition-all flex flex-col items-center gap-1 text-center"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Recruiter</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@careercloud.edu')}
              className="px-2 py-2 text-[11px] font-semibold text-slate-700 bg-white hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200/80 shadow-2xs transition-all flex flex-col items-center gap-1 text-center"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Placement</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1.5">
            <p>
              New student?{' '}
              <Link to="/register/student" className="font-bold text-indigo-600 hover:underline">
                Create Student Account
              </Link>
            </p>
            <p>
              Corporate recruiter?{' '}
              <Link to="/register/recruiter" className="font-bold text-slate-700 hover:underline">
                Register Company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
