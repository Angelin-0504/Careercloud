import React from 'react';
import { X, CheckCircle, AlertTriangle, Cpu, GraduationCap, Award, Calendar } from 'lucide-react';
import { MatchScoreDetails } from '../../types';

interface MatchExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  details: MatchScoreDetails;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  details,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                Matching Algorithm Analysis
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{jobTitle}</h3>
            <p className="text-xs text-slate-500">{companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Score Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              details.is_eligible
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            <div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-75">
                Overall Compatibility
              </div>
              <div className="text-3xl font-extrabold flex items-baseline gap-1 mt-0.5">
                {details.match_score}
                <span className="text-sm font-semibold opacity-60">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              {details.is_eligible ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Eligible Candidate
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Criteria Not Met
                </div>
              )}
            </div>
          </div>

          {/* Ineligibility Warning if any */}
          {!details.is_eligible && details.ineligibility_reasons.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Hard Constraint Ineligibility Reasons:
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-rose-700">
                {details.ineligibility_reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Score Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Rule-Based Scoring Breakdown
            </h4>
            <div className="space-y-2.5">
              {/* Skills */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">Skills Alignment (Weight: 50%)</span>
                </div>
                <span className="font-bold text-slate-900">{details.skills_score} / 50 pts</span>
              </div>

              {/* Department */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">Department / Major (Weight: 20%)</span>
                </div>
                <span className="font-bold text-slate-900">{details.dept_score} / 20 pts</span>
              </div>

              {/* CGPA */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">CGPA Requirement (Weight: 15%)</span>
                </div>
                <span className="font-bold text-slate-900">{details.cgpa_score} / 15 pts</span>
              </div>

              {/* Graduation Batch */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">Graduation Year (Weight: 15%)</span>
                </div>
                <span className="font-bold text-slate-900">{details.grad_score} / 15 pts</span>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Matched Skills ({details.matched_skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {details.matched_skills.length > 0 ? (
                  details.matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No matching skills identified</span>
                )}
              </div>
            </div>

            {details.missing_skills.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Missing Required Skills ({details.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {details.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explanation Text */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Algorithm Rationale: </span>
            {details.explanation}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
