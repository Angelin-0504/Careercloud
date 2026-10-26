import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Briefcase, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { SavedJob } from '../../types';
import { JobCard } from '../../components/cards/JobCard';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await api.applications.getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (jobId: number) => {
    try {
      await api.applications.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((s) => s.job_id !== jobId));
    } catch (err) {
      console.error('Failed to remove saved job:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading your shortlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Job Shortlist</h1>
        <p className="text-xs text-slate-500">
          Openings you have bookmarked for review and future application
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Your Shortlist is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any job card in Explore Jobs to save opportunities here.
          </p>
          <Link
            to="/explore-jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
          >
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((item) =>
            item.job ? (
              <JobCard
                key={item.id}
                job={{ ...item.job, is_saved: true }}
                onSaveToggle={() => handleRemove(item.job_id)}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};
