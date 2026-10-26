import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';

export const ManageJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.jobs.list({ status: 'all' });
      setJobs(data);
    } catch (err) {
      console.error('Failed to load company jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleToggleStatus = async (job: Job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await api.jobs.update(job.id, { status: nextStatus });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading your published jobs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Campus Jobs</h1>
          <p className="text-xs text-slate-500">
            Monitor active candidate applications, edit role descriptions, or close filled positions
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post New Position
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Jobs Published Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first campus recruitment opening to start receiving pre-matched candidate applications.
          </p>
          <Link
            to="/recruiter/post-job"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
          >
            Create Job Opening
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">Position Title</th>
                  <th className="py-3 px-4 font-bold">Type & Location</th>
                  <th className="py-3 px-4 font-bold">Min CGPA</th>
                  <th className="py-3 px-4 font-bold">Applicants</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link to={`/jobs/${job.id}`} className="hover:text-indigo-600">
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{job.job_type}</div>
                      <div className="text-[11px] text-slate-400">{job.location}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {job.min_cgpa > 0 ? `${job.min_cgpa} Cutoff` : 'No Cutoff'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/recruiter/applicants?jobId=${job.id}`}
                        className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {job.applicants_count} Applicants
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.status === 'closed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(job)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          job.status === 'active'
                            ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {job.status === 'active' ? 'Close Opening' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
