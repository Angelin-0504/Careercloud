import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle, ShieldCheck, Briefcase } from 'lucide-react';
import { api } from '../../services/api';

export const ManageRecruitersPage: React.FC = () => {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadRecruiters = async () => {
    setLoading(true);
    try {
      const data = await api.admin.listRecruiters();
      setRecruiters(data);
    } catch (err) {
      console.error('Failed to load recruiters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiters();
  }, []);

  const handleToggleVerification = async (companyId: number) => {
    setTogglingId(companyId);
    try {
      await api.admin.toggleCompanyVerify(companyId);
      setRecruiters((prev) =>
        prev.map((r) =>
          r.company_id === companyId
            ? { ...r, company_is_verified: !r.company_is_verified }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading corporate recruiter partners...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Recruiters & Corporate Partners
        </h1>
        <p className="text-xs text-slate-500">
          Verify registered corporate entities, monitor posted job volumes, and manage institutional partner trust
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-bold">Company Name</th>
                <th className="py-3 px-4 font-bold">Industry Sector</th>
                <th className="py-3 px-4 font-bold">Recruiter Contact</th>
                <th className="py-3 px-4 font-bold">Location</th>
                <th className="py-3 px-4 font-bold">Openings</th>
                <th className="py-3 px-4 font-bold">Verification Status</th>
                <th className="py-3 px-4 font-bold text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recruiters.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{r.company_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{r.company_industry}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{r.full_name}</div>
                    <div className="text-[11px] text-slate-400">{r.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{r.company_location}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {r.jobs_count} Jobs
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.company_is_verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Partner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Pending Review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.company_id && (
                      <button
                        type="button"
                        disabled={togglingId === r.company_id}
                        onClick={() => handleToggleVerification(r.company_id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                          r.company_is_verified
                            ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {r.company_is_verified ? 'Revoke Approval' : 'Approve Partner'}
                      </button>
                    )}
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
