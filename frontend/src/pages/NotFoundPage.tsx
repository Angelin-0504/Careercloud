import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm mb-2">
        <Cloud className="w-8 h-8" />
      </div>
      <span className="text-4xl font-black text-slate-900 tracking-tight">404</span>
      <h1 className="text-lg font-bold text-slate-800">Page Not Found in CareerCloud</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        The requested URL was not found on this placement portal or the route has been relocated.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
};
