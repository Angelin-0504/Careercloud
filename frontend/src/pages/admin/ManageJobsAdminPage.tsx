import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Flag, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';

export const ManageJobsAdminPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.jobs.list({ status: 'all' });
      setJobs(data);
    } catch (err) {
      console.error('Failed to load admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleToggleFlag = async (jobId: number) => {
    setTogglingId(jobId);
    try {
      await api.admin.toggleJobFlag(jobId);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, status: j.status === 'flagged' ? 'active' : 'flagged' }
            : j
        )
      );
    } catch (err) {
      console.error('Failed to toggle job flag:', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading campus job listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campus Job Moderation</h1>
        <p className="text-xs text-slate-500">
          Review published campus openings, enforce minimum academic compliance, and flag non-compliant listings
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-bold">Job Title</th>
                <th className="py-3 px-4 font-bold">Company</th>
                <th className="py-3 px-4 font-bold">Type & Location</th>
                <th className="py-3 px-4 font-bold">Min CGPA</th>
                <th className="py-3 px-4 font-bold">Applicants</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="font-bold text-slate-900 hover:text-indigo-600 inline-flex items-center gap-1"
                    >
                      {job.title}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{job.company?.name}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{job.job_type}</div>
                    <div className="text-[11px] text-slate-400">{job.location}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {job.min_cgpa > 0 ? `${job.min_cgpa} Cutoff` : 'No Cutoff'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">{job.applicants_count}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        job.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : job.status === 'flagged'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      disabled={togglingId === job.id}
                      onClick={() => handleToggleFlag(job.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        job.status === 'flagged'
                          ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          : 'text-rose-700 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      {job.status === 'flagged' ? 'Restore Active' : 'Flag Listing'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
