import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Sparkles,
  Briefcase,
  MapPin,
  GraduationCap,
  X,
  SlidersHorizontal,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';
import { JobCard } from '../components/cards/JobCard';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const JobDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyingId, setIsApplyingId] = useState<number | null>(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [applyErrorMsg, setApplyErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [jobType, setJobType] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [recommendationsOnly, setRecommendationsOnly] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setApplyErrorMsg(null);
    try {
      if (recommendationsOnly && user?.role === 'student') {
        const recs = await api.jobs.getRecommendations();
        setJobs(recs);
      } else {
        const fetched = await api.jobs.list({
          search: search || undefined,
          job_type: jobType || undefined,
          department: department || undefined,
          min_cgpa: minCgpa ? parseFloat(minCgpa) : undefined,
        });

        // If student, attach recommendation scores to regular list if available
        if (user?.role === 'student') {
          try {
            const recs = await api.jobs.getRecommendations();
            const recMap = new Map(recs.map((r) => [r.id, r.match_details]));
            const merged = fetched.map((j) => ({
              ...j,
              match_details: recMap.get(j.id) || j.match_details,
            }));
            setJobs(merged);
          } catch (e) {
            setJobs(fetched);
          }
        } else {
          setJobs(fetched);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams, recommendationsOnly, jobType, department, minCgpa]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchParams({ search: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleApply = async (jobId: number) => {
    if (!user) {
      setApplyErrorMsg('Please sign in as a student to apply for campus openings.');
      return;
    }
    if (user.role !== 'student') {
      setApplyErrorMsg('Only verified student accounts can apply for job openings.');
      return;
    }

    setIsApplyingId(jobId);
    setApplyErrorMsg(null);
    setApplySuccessMsg(null);

    try {
      await api.applications.apply(jobId);
      setApplySuccessMsg('Application submitted successfully! Recruiter has been notified.');
      refreshNotifications();

      // Update local status
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, has_applied: true } : j))
      );
    } catch (err: any) {
      setApplyErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setIsApplyingId(null);
    }
  };

  const handleSaveToggle = async (jobId: number, currentlySaved: boolean) => {
    if (!user || user.role !== 'student') return;
    try {
      if (currentlySaved) {
        await api.applications.removeSavedJob(jobId);
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, is_saved: false } : j))
        );
      } else {
        await api.applications.saveJob(jobId);
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, is_saved: true } : j))
        );
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setJobType('');
    setDepartment('');
    setMinCgpa('');
    setRecommendationsOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Explore Placement Opportunities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified corporate jobs and internships with explainable matching scores
          </p>
        </div>

        {user?.role === 'student' && (
          <button
            type="button"
            onClick={() => setRecommendationsOnly(!recommendationsOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              recommendationsOnly
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {recommendationsOnly ? 'Showing Recommended First' : 'Filter by Top Match %'}
          </button>
        )}
      </div>

      {/* Status Banners */}
      {applySuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{applySuccessMsg}</span>
          </div>
          <button onClick={() => setApplySuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {applyErrorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{applyErrorMsg}</span>
          </div>
          <button onClick={() => setApplyErrorMsg(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, skills (e.g. Python, AWS, Docker), or company..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science & Eng</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Electronics">Electronics & Comm</option>
            </select>
          </div>

          <div>
            <select
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
            >
              <option value="">Any CGPA Cutoff</option>
              <option value="7.0">Max Cutoff: 7.0 CGPA</option>
              <option value="7.5">Max Cutoff: 7.5 CGPA</option>
              <option value="8.0">Max Cutoff: 8.0 CGPA</option>
              <option value="8.5">Max Cutoff: 8.5 CGPA</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            {(search || jobType || department || minCgpa || recommendationsOnly) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-200/60 animate-pulse"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Matching Positions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, department filter, or CGPA cutoff parameters.
          </p>
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Showing {jobs.length} campus postings</span>
            {user?.role === 'student' && (
              <span className="text-indigo-600">✓ Click any match badge to view rule-based rationale</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onSaveToggle={handleSaveToggle}
                isApplying={isApplyingId === job.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
