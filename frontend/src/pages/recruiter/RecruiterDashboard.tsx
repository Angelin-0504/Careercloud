import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Award,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { RecruiterDashboardStats, RecruiterProfile } from '../../types';
import { StatCard } from '../../components/cards/StatCard';

export const RecruiterDashboard: React.FC = () => {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [stats, setStats] = useState<RecruiterDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profData, statsData] = await Promise.all([
          api.recruiters.getProfile(),
          api.recruiters.getDashboard(),
        ]);
        setProfile(profData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Company Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {profile?.company?.logo_url ? (
            <img
              src={profile.company.logo_url}
              alt={profile.company.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              {profile?.company?.name?.slice(0, 2).toUpperCase() || 'CC'}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{profile?.company?.name}</h1>
              {profile?.company?.is_verified && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Verified Partner
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {profile?.designation} • {profile?.company?.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/post-job"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Post New Opening
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Openings"
          value={stats?.active_jobs ?? 0}
          subtitle={`Total posted: ${stats?.total_jobs_posted ?? 0}`}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Total Applicants"
          value={stats?.total_applicants ?? 0}
          subtitle="Student applications received"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={stats?.shortlisted_count ?? 0}
          subtitle="Passed initial screening"
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          title="Offers / Hired"
          value={stats?.selected_count ?? 0}
          subtitle="Selected campus candidates"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Recent Applicants Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Recent Campus Applicants</h2>
            <p className="text-xs text-slate-500">Candidates applying for your active campus job postings</p>
          </div>
          <Link
            to="/recruiter/applicants"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            Manage All Applicants
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recent_applications && stats.recent_applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-medium">Candidate Name</th>
                  <th className="pb-2.5 font-medium">Job Title</th>
                  <th className="pb-2.5 font-medium">Department</th>
                  <th className="pb-2.5 font-medium">CGPA</th>
                  <th className="pb-2.5 font-medium">Applied Date</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{app.student_name}</td>
                    <td className="py-3 text-slate-700">{app.job_title}</td>
                    <td className="py-3 text-slate-500">{app.department}</td>
                    <td className="py-3 font-semibold text-slate-700">{app.cgpa}</td>
                    <td className="py-3 text-slate-400">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'Selected'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'Shortlisted'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/recruiter/applicants"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No applicant records found. Published job openings will collect applications here.
          </div>
        )}
      </div>
    </div>
  );
};
