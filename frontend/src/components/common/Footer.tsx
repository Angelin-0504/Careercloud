import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Shield, Database, Cpu, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">CareerCloud</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cloud-Based Student Placement and Job Matching Portal. Engineered with FastAPI, React, PostgreSQL, and scalable AWS cloud services.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All Cloud Services Operational
            </div>
          </div>

          {/* Cloud Stack Architecture */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Cloud Computing Stack
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>AWS App Runner / Container API</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Amazon RDS PostgreSQL</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Amazon S3 Encrypted Resumes</span>
              </li>
              <li className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span>AWS Amplify / CloudFront CDN</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Portal Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore-jobs" className="hover:text-white transition-colors">
                  Browse Campus Jobs
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-white transition-colors">
                  System & Cloud Architecture
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  User Login & Demo Accounts
                </Link>
              </li>
              <li>
                <Link to="/register/student" className="hover:text-white transition-colors">
                  Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Capstone Notice */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Capstone Project
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-2">
              Developed as a Cloud Computing course capstone project. Includes rule-based skills matching, secure private file abstraction, and AWS deployment guides.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="text-indigo-400 font-semibold">Demo Credentials:</span> Password@123
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} CareerCloud Placement Portal. Designed for Cloud Computing Academic Project.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Model</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy & Resumes</span>
            <span>•</span>
            <Link to="/architecture" className="hover:text-slate-400">
              AWS Architecture Spec
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
