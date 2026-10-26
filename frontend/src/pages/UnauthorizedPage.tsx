import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm mb-2">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="text-4xl font-black text-rose-600 tracking-tight">403</span>
      <h1 className="text-lg font-bold text-slate-800">Access Restricted by Role-Based Security</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        Your current user role does not hold permissions to view this administrative resource.
      </p>
      <div className="pt-2 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          Return to Portal
        </Link>
      </div>
    </div>
  );
};
