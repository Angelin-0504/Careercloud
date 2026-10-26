import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  Clock,
  Award,
  Bookmark,
  ArrowRight,
  Upload,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudentDashboardStats, Job, Application } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/cards/StatCard';
import { JobCard } from '../../components/cards/JobCard';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, recsData, appsData] = await Promise.all([
          api.students.getDashboard(),
          api.jobs.getRecommendations(),
          api.applications.getMyApplications(),
        ]);
        setStats(statsData);
        setRecommendedJobs(recsData.slice(0, 4));
        setRecentApplications(appsData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading personalized student dashboard...</p>
      </div>
    );
  }

  const completionPercent = stats?.profile_completion || 75;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider bg-indigo-800/40 px-2.5 py-0.5 rounded-full border border-indigo-700/50">
              Student Placement Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Explore your personalized job matches, track submitted campus applications, and monitor interview schedules.
            </p>
          </div>

          {/* Profile Completion Bar */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full md:w-72 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Profile Readiness</span>
              <span className="font-bold text-white">{completionPercent}%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <Link
              to="/student/profile"
              className="text-[11px] text-indigo-300 hover:text-white font-semibold flex items-center gap-1 mt-1"
            >
              Update academic info & resume →
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Applications Sent"
          value={stats?.total_applied ?? 0}
          subtitle="Submitted across campus"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Shortlisted"
          value={stats?.shortlisted ?? 0}
          subtitle="Cleared resume screening"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Interviews"
          value={stats?.interviews ?? 0}
          subtitle="Scheduled technical rounds"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Offers / Selected"
          value={stats?.selected ?? 0}
          subtitle="Final placement offers"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Explainable Recommended Jobs Carousel/Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Recommended for Your Profile
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Ranked by our rule-based algorithm according to your skills, CGPA, and department
            </p>
          </div>
          <Link
            to="/explore-jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Explore all {stats?.recommended_jobs_count || 'openings'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">No recommended jobs found. Make sure your profile skills are up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Application Pipeline Status</h3>
            <Link
              to="/student/applications"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View Full History
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              You haven't submitted any job applications yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium">Job Title</th>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium">Applied Date</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">{app.job?.title}</td>
                      <td className="py-3 text-slate-600">{app.job?.company?.name}</td>
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
                              : app.status === 'Interview Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Card (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Quick Profile Actions</h3>
          <div className="space-y-2.5 text-xs">
            <Link
              to="/student/profile"
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-slate-700 group-hover:text-indigo-700">
                  Upload / Replace Resume PDF
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link
              to="/student/profile"
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-slate-700 group-hover:text-indigo-700">
                  Update Technical Skills
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link
              to="/student/saved"
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-slate-700 group-hover:text-indigo-700">
                  View Saved Shortlist
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
