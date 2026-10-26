import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Application } from '../../types';

export const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const data = await api.applications.getMyApplications();
        setApplications(data);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Selected / Offer Extended
          </span>
        );
      case 'Interview Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Interview Scheduled
          </span>
        );
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            Shortlisted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Application Submitted
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Job Applications</h1>
        <p className="text-xs text-slate-500">
          Track the recruitment pipeline and review notes from campus talent partners
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Applications Submitted Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse through eligible opportunities matching your technical skills and submit applications in 1-click.
          </p>
          <Link
            to="/explore-jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
          >
            Explore Campus Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {app.job?.company?.logo_url ? (
                  <img
                    src={app.job.company.logo_url}
                    alt={app.job.company.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {app.job?.company?.name?.slice(0, 2).toUpperCase() || 'CC'}
                  </div>
                )}

                <div className="space-y-1">
                  <Link
                    to={`/jobs/${app.job?.id}`}
                    className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    {app.job?.title}
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                  <p className="text-xs text-slate-500">{app.job?.company?.name}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{app.job?.location}</span>
                  </div>

                  {app.notes && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Recruiter Note: </span>
                      {app.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0">
                {getStatusBadge(app.status)}
                <span className="text-[10px] text-slate-400">
                  Updated {new Date(app.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
