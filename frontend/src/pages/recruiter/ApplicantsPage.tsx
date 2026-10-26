import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Calendar,
  Award,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { Job, Application } from '../../types';

export const ApplicantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJobId, setActiveJobId] = useState<string>(selectedJobId || '');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const jobsData = await api.jobs.list({ status: 'all' });
        setJobs(jobsData);
        if (jobsData.length > 0) {
          const defaultJobId = selectedJobId || String(jobsData[0].id);
          setActiveJobId(defaultJobId);
          loadApplicants(parseInt(defaultJobId, 10));
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load initial jobs:', err);
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadApplicants = async (jobId: number) => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await api.applications.getJobApplicants(jobId);
      setApplicants(data);
    } catch (err: any) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (jobIdStr: string) => {
    setActiveJobId(jobIdStr);
    setSearchParams(jobIdStr ? { jobId: jobIdStr } : {});
    if (jobIdStr) {
      loadApplicants(parseInt(jobIdStr, 10));
    } else {
      setApplicants([]);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: string) => {
    setUpdatingId(appId);
    setFeedback(null);
    try {
      await api.applications.updateStatus(appId, newStatus);
      setFeedback({
        type: 'success',
        text: `Applicant status updated to '${newStatus}'. Student received in-app notification.`,
      });
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus as any } : a))
      );
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadResume = async (resumeId: number, candidateName: string) => {
    try {
      const token = localStorage.getItem('careercloud_token');
      const response = await fetch(`/api/v1/resumes/${resumeId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Authorized resume download failed or rejected');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName.replace(' ', '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Unable to download candidate resume.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Applicant Tracking & Screening
          </h1>
          <p className="text-xs text-slate-500">
            Review qualified campus candidates, verify technical skills, and manage recruitment pipeline stages
          </p>
        </div>

        {/* Job Filter Selector */}
        {jobs.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={activeJobId}
              onChange={(e) => handleJobChange(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.applicants_count || 0} applicants)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading candidates from database...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Applicants for this Position</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When students submit applications through the matching portal, their verified profiles and resumes will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">Candidate</th>
                  <th className="py-3 px-4 font-bold">Department & Degree</th>
                  <th className="py-3 px-4 font-bold">CGPA & Year</th>
                  <th className="py-3 px-4 font-bold">Technical Skills</th>
                  <th className="py-3 px-4 font-bold">Resume Vault</th>
                  <th className="py-3 px-4 font-bold">Pipeline Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map((app) => {
                  const student = app.student;
                  const studentUser = student?.user;
                  const firstResume = student?.resumes?.[0];

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{studentUser?.full_name || 'Candidate'}</div>
                        <div className="text-[11px] text-slate-400">{studentUser?.email}</div>
                        {student?.phone && (
                          <div className="text-[10px] text-slate-400">{student.phone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-semibold">{student?.department}</div>
                        <div className="text-[11px] text-slate-400">{student?.degree}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student?.cgpa} CGPA</div>
                        <div className="text-[11px] text-slate-400">Class of {student?.graduation_year}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {student?.skills
                            ? student.skills.split(',').slice(0, 3).map((s, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                                >
                                  {s.trim()}
                                </span>
                              ))
                            : '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {firstResume ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadResume(firstResume.id, studentUser?.full_name || 'Student')
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs cursor-pointer transition-colors"
                            title="Download verified candidate resume"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF Resume
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No Resume</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            app.status === 'Selected'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : app.status === 'Shortlisted'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                              : app.status === 'Interview Scheduled'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Selected">Selected / Placed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
