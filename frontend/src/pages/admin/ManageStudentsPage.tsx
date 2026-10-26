import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, GraduationCap, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const ManageStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [placedFilter, setPlacedFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await api.admin.listStudents({
        search: search || undefined,
        department: department || undefined,
        placed: placedFilter !== '' ? placedFilter === 'true' : undefined,
      });
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [department, placedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await api.admin.exportStudentsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careercloud_students_directory.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export students CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Students Directory</h1>
          <p className="text-xs text-slate-500">
            Monitor institutional enrollment, academic CGPAs, and verified placement statuses
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={exporting}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Generating CSV...' : 'Export Directory (CSV)'}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or skills..."
              className="w-full pl-10 pr-3.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="">All Academic Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <div>
            <select
              value={placedFilter}
              onChange={(e) => setPlacedFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="">All Placement Statuses</option>
              <option value="true">Placed Candidates Only</option>
              <option value="false">Unplaced Candidates Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="p-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Querying student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Student Records Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your department or search query filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">Student Name</th>
                  <th className="py-3 px-4 font-bold">Department & Degree</th>
                  <th className="py-3 px-4 font-bold">Graduation Year</th>
                  <th className="py-3 px-4 font-bold">CGPA</th>
                  <th className="py-3 px-4 font-bold">Technical Skills</th>
                  <th className="py-3 px-4 font-bold">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{st.full_name}</div>
                      <div className="text-[11px] text-slate-400">{st.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{st.department}</div>
                      <div className="text-[11px] text-slate-400">{st.degree}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{st.graduation_year}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{st.cgpa}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {st.skills
                          ? st.skills.split(',').slice(0, 3).map((s: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                              >
                                {s.trim()}
                              </span>
                            ))
                          : '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {st.is_placed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Placed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Unplaced
                        </span>
                      )}
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
