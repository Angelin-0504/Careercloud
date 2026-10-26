import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck,
  Award,
  Download,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { api } from '../../services/api';
import { AdminDashboardStats } from '../../types';
import { StatCard } from '../../components/cards/StatCard';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPlacements, setExportingPlacements] = useState(false);
  const [exportingStudents, setExportingStudents] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.admin.getDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleExportPlacements = async () => {
    setExportingPlacements(true);
    try {
      const blob = await api.admin.exportPlacementsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careercloud_placements_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export placements CSV:', err);
    } finally {
      setExportingPlacements(false);
    }
  };

  const handleExportStudents = async () => {
    setExportingStudents(true);
    try {
      const blob = await api.admin.exportStudentsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careercloud_students_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export students CSV:', err);
    } finally {
      setExportingStudents(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Calculating real-time institutional placement statistics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
            University Placement Cell Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Placement Analytics & Institutional Governance
          </h1>
          <p className="text-xs text-slate-500">
            Real-time analytics computed strictly from validated database records and student offer contracts
          </p>
        </div>

        {/* CSV Export Triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPlacements}
            disabled={exportingPlacements}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            {exportingPlacements ? 'Exporting...' : 'Placements Report (CSV)'}
          </button>

          <button
            type="button"
            onClick={handleExportStudents}
            disabled={exportingStudents}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {exportingStudents ? 'Exporting...' : 'Students Directory (CSV)'}
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Placement Rate"
          value={`${stats?.placement_rate ?? 0}%`}
          subtitle="Placed / Eligible Students"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Students Placed"
          value={stats?.total_placed ?? 0}
          subtitle="Unique offers extended"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Registered Students"
          value={stats?.total_students ?? 0}
          subtitle="Profiles in database"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Companies"
          value={stats?.total_companies ?? 0}
          subtitle="Verified hiring partners"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Campus Jobs"
          value={stats?.total_jobs ?? 0}
          subtitle="Published opportunities"
          icon={Briefcase}
          color="amber"
        />
        <StatCard
          title="Total Applications"
          value={stats?.total_applications ?? 0}
          subtitle="Submissions received"
          icon={FileCheck}
          color="indigo"
        />
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department-wise Placement Rates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Department-wise Placement Performance</h2>
              <p className="text-xs text-slate-500">Placement percentage by engineering major</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Academic Year 2025-26
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.department_stats || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  tickFormatter={(val) => val.split(' ')[0]}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Placement Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="placement_rate" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Recruitment Trends */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Application vs Selection Velocity</h2>
              <p className="text-xs text-slate-500">Monthly application submissions and student selections</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Recruitment Trends
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats?.monthly_trends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="selections"
                  name="Selections"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Hiring Companies & Recent System Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hiring Companies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Top Campus Hiring Partners</h3>
            <Link to="/admin/recruiters" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All Partners
            </Link>
          </div>

          {stats?.company_stats && stats.company_stats.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.company_stats.map((comp, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-bold text-slate-400">{idx + 1}</span>
                    <div>
                      <span className="font-bold text-slate-800">{comp.company_name}</span>
                      {comp.avg_package_lpa && (
                        <div className="text-[10px] text-slate-400">
                          Average Package: ₹{comp.avg_package_lpa} LPA
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                    {comp.placements_count} Students Placed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No placements recorded yet. Once recruiters select candidates, company statistics will rank here.
            </div>
          )}
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Recent Platform Audit Log</h3>
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-indigo-600 hover:underline">
              Full Audit Trail
            </Link>
          </div>

          {stats?.recent_activities && stats.recent_activities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recent_activities.map((act) => (
                <div key={act.id} className="py-2.5 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800">{act.action}</span>
                    <p className="text-[11px] text-slate-500">{act.details || `${act.resource_type} modified`}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600">{act.user_name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No audit logs registered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
