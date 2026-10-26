import React, { useState, useEffect } from 'react';
import { ShieldCheck, Filter, Calendar, Activity } from 'lucide-react';
import { api } from '../../services/api';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAuditLogs({
        action: actionFilter || undefined,
        limit: 150,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security & Compliance Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable chronological record of administrative actions, status updates, and user activity
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl shadow-2xs focus:outline-none"
          >
            <option value="">All Platform Actions</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="USER_REGISTER">New Registrations</option>
            <option value="JOB_POSTED">Job Postings</option>
            <option value="APPLICATION_SUBMITTED">Applications</option>
            <option value="APPLICATION_STATUS_UPDATED">Status Changes</option>
            <option value="COMPANY_VERIFICATION_CHANGED">Company Verifications</option>
            <option value="RESUME_UPLOADED">Resume Uploads</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Querying security audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Activity className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Audit Logs Found</h3>
          <p className="text-xs text-slate-500">Try clearing the action filter to view all events.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Resource Target</th>
                  <th className="py-3 px-4 font-bold">Actor Account</th>
                  <th className="py-3 px-4 font-bold">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{log.user_email}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-md truncate">
                      {log.details || '—'}
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
