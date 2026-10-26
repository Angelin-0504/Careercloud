import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Bookmark,
  BookmarkCheck,
  Award,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { Job } from '../../types';
import { MatchScoreBadge } from './MatchScoreBadge';
import { MatchExplanationModal } from './MatchExplanationModal';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: number) => void;
  onSaveToggle?: (jobId: number, currentlySaved: boolean) => void;
  isApplying?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onSaveToggle,
  isApplying = false,
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const skillsList = job.required_skills
    ? job.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between group">
        <div>
          {/* Top Row: Company Info & Match Badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {job.company?.logo_url ? (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="w-11 h-11 rounded-lg object-cover border border-slate-100 shadow-xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {job.company?.name ? job.company.name.slice(0, 2).toUpperCase() : 'CC'}
                </div>
              )}
              <div>
                <h3
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                >
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{job.company?.name || 'Company'}</span>
                  {job.company?.is_verified && (
                    <span className="inline-flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Match Score Badge */}
            {job.match_details && (
              <MatchScoreBadge
                score={job.match_details.match_score}
                isEligible={job.match_details.is_eligible}
                size="md"
                onClick={() => setShowModal(true)}
              />
            )}
          </div>

          {/* Key Job Meta Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              {job.job_type}
            </span>
            {job.salary_range && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 font-medium text-slate-700">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                {job.salary_range}
              </span>
            )}
            {job.min_cgpa > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/60 text-indigo-700 border border-indigo-100 font-medium">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                Min CGPA: {job.min_cgpa}
              </span>
            )}
          </div>

          {/* Description Preview */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3.5">
            {job.description}
          </p>

          {/* Required Skills Chips */}
          {skillsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {skillsList.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-normal border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}
              {skillsList.length > 4 && (
                <span className="text-[11px] px-1.5 py-0.5 text-slate-400 font-medium">
                  +{skillsList.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {onSaveToggle && (
              <button
                type="button"
                onClick={() => onSaveToggle(job.id, !!job.is_saved)}
                className={`p-2 rounded-lg border transition-colors ${
                  job.is_saved
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50'
                }`}
                title={job.is_saved ? 'Remove from shortlist' : 'Save to shortlist'}
              >
                {job.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
            >
              Details
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            {job.has_applied ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Applied
              </span>
            ) : onApply ? (
              <button
                type="button"
                onClick={() => onApply(job.id)}
                disabled={isApplying}
                className="text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow cursor-pointer disabled:opacity-50"
                title="Apply for this role"
              >
                {isApplying ? 'Submitting...' : 'Apply Now'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Match Explanation Modal */}
      {job.match_details && (
        <MatchExplanationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          jobTitle={job.title}
          companyName={job.company?.name || 'Company'}
          details={job.match_details}
        />
      )}
    </>
  );
};
