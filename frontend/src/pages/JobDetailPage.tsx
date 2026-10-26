import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Award,
  Calendar,
  Globe,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Cpu,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { MatchScoreBadge } from '../components/cards/MatchScoreBadge';
import { MatchExplanationModal } from '../components/cards/MatchExplanationModal';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchJob = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.jobs.getById(parseInt(id, 10));

      // If student, check if match score exists
      if (user?.role === 'student') {
        try {
          const recs = await api.jobs.getRecommendations();
          const match = recs.find((r) => r.id === data.id);
          if (match) {
            data.match_details = match.match_details;
          }
        } catch (e) {
          // Ignore
        }
      }

      setJob(data);
    } catch (err: any) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    if (!job) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      setFeedbackMsg({ type: 'error', text: 'Only student accounts can apply for jobs.' });
      return;
    }

    setIsApplying(true);
    setFeedbackMsg(null);
    try {
      await api.applications.apply(job.id);
      setFeedbackMsg({ type: 'success', text: 'Application submitted successfully to recruiter!' });
      setJob((prev) => (prev ? { ...prev, has_applied: true } : null));
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to submit application.' });
    } finally {
      setIsApplying(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!job || !user || user.role !== 'student') return;
    try {
      if (job.is_saved) {
        await api.applications.removeSavedJob(job.id);
        setJob((prev) => (prev ? { ...prev, is_saved: false } : null));
      } else {
        await api.applications.saveJob(job.id);
        setJob((prev) => (prev ? { ...prev, is_saved: true } : null));
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading opening details from database...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Job Posting Not Found</h2>
        <Link to="/explore-jobs" className="text-xs text-indigo-600 font-bold hover:underline">
          Return to Explore Jobs
        </Link>
      </div>
    );
  }

  const skillsList = job.required_skills
    ? job.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const deptsList = job.eligible_departments
    ? job.eligible_departments.split(',').map((d) => d.trim()).filter(Boolean)
    : [];

  const batchesList = job.eligible_graduation_years
    ? job.eligible_graduation_years.split(',').map((y) => y.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {job.company?.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={job.company.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xl">
                {job.company?.name ? job.company.name.slice(0, 2).toUpperCase() : 'CC'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{job.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-sm text-slate-700">{job.company?.name}</span>
                {job.company?.is_verified && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    Verified Partner
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user?.role === 'student' && (
              <button
                type="button"
                onClick={handleBookmarkToggle}
                className={`p-2.5 rounded-xl border transition-colors ${
                  job.is_saved
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title={job.is_saved ? 'Remove shortlist' : 'Shortlist job'}
              >
                {job.is_saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            )}

            {job.has_applied ? (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Applied
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow cursor-pointer disabled:opacity-50"
              >
                {isApplying ? 'Submitting...' : 'Apply for Opening'}
              </button>
            )}
          </div>
        </div>

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">
            <MapPin className="w-4 h-4 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">
            <Briefcase className="w-4 h-4 text-slate-400" />
            {job.job_type}
          </span>
          {job.salary_range && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 font-bold text-slate-900">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              {job.salary_range}
            </span>
          )}
          {job.min_cgpa > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
              <Award className="w-4 h-4 text-indigo-600" />
              Minimum CGPA: {job.min_cgpa}
            </span>
          )}
          {job.application_deadline && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              Deadline: {new Date(job.application_deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Match Algorithm Banner for Student */}
      {job.match_details && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            job.match_details.is_eligible
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-amber-50/80 border-amber-200'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Compatibility Engine:
              </span>
              <MatchScoreBadge
                score={job.match_details.match_score}
                isEligible={job.match_details.is_eligible}
                size="md"
              />
            </div>
            <p className="text-xs text-slate-600 max-w-xl">{job.match_details.explanation}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowMatchModal(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs shrink-0 cursor-pointer"
          >
            View Point Breakdown
          </button>
        </div>
      )}

      {/* Content Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Description & Responsibilities */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Role Description
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Required Technical Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Eligibility Criteria & Company Profile */}
        <div className="space-y-6">
          {/* Eligibility Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Eligibility Rules
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Eligible Departments:</span>
                <span className="font-semibold text-slate-800">
                  {deptsList.length > 0 ? deptsList.join(', ') : 'All Engineering Departments'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Graduation Years:</span>
                <span className="font-semibold text-slate-800">
                  {batchesList.length > 0 ? batchesList.join(', ') : '2024, 2025, 2026, 2027, 2028'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Minimum CGPA:</span>
                <span className="font-semibold text-slate-800">{job.min_cgpa} Cutoff</span>
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              About {job.company?.name}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {job.company?.description || 'Campus hiring partner registered on CareerCloud.'}
            </p>
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.company?.industry}</span>
              </div>
              {job.company?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline truncate"
                  >
                    {job.company.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Match Explanation Modal */}
      {job.match_details && (
        <MatchExplanationModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          jobTitle={job.title}
          companyName={job.company?.name || 'Company'}
          details={job.match_details}
        />
      )}
    </div>
  );
};
