import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Cpu,
} from 'lucide-react';
import { api } from '../../services/api';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [location, setLocation] = useState('Bangalore, India (Hybrid)');
  const [salaryRange, setSalaryRange] = useState('₹8,00,000 - ₹12,00,000 / year');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [eligibleDepartments, setEligibleDepartments] = useState([
    'Computer Science & Engineering',
    'Information Technology',
  ]);
  const [eligibleGraduationYears, setEligibleGraduationYears] = useState([
    '2024',
    '2025',
    '2026',
    '2027',
    '2028',
  ]);
  const [requiredSkills, setRequiredSkills] = useState('Python, AWS, Docker');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableDepts = [
    'Computer Science & Engineering',
    'Information Technology',
    'Data Science',
    'Electronics & Communication',
    'Mechanical Engineering',
  ];

  const handleDeptToggle = (dept: string) => {
    if (eligibleDepartments.includes(dept)) {
      setEligibleDepartments(eligibleDepartments.filter((d) => d !== dept));
    } else {
      setEligibleDepartments([...eligibleDepartments, dept]);
    }
  };

  const handleYearToggle = (year: string) => {
    if (eligibleGraduationYears.includes(year)) {
      setEligibleGraduationYears(eligibleGraduationYears.filter((y) => y !== year));
    } else {
      setEligibleGraduationYears([...eligibleGraduationYears, year]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (eligibleDepartments.length === 0) {
      setError('Please select at least one eligible academic department.');
      return;
    }

    if (eligibleGraduationYears.length === 0) {
      setError('Please select at least one eligible graduation year.');
      return;
    }

    setLoading(true);
    try {
      await api.jobs.create({
        title,
        description,
        job_type: jobType,
        location,
        salary_range: salaryRange,
        min_cgpa: parseFloat(minCgpa),
        eligible_departments: eligibleDepartments.join(', '),
        eligible_graduation_years: eligibleGraduationYears.join(', '),
        required_skills: requiredSkills,
        application_deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });

      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to publish job opening.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/recruiter/jobs"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Publish New Campus Job Opening
          </h1>
          <p className="text-xs text-slate-500">
            Define role parameters, required technical skills, and candidate eligibility criteria
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Position Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Job Title / Designation *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Associate Cloud DevOps Engineer"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Job Type *
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Full-time">Full-time Graduate Hire</option>
                <option value="Internship">Summer / Fall Internship</option>
                <option value="Contract">Contract / Project-based</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Hyderabad, Remote"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Salary / Compensation Range
              </label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. ₹8,00,000 - ₹12,00,000 / year"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Matching Engine Parameters & Eligibility */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Candidate Eligibility Constraints</span>
            <span className="text-[10px] text-indigo-600 normal-case font-semibold">
              Configured directly into rule-based matching engine
            </span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Required Technical Skills (Comma-Separated) *
            </label>
            <input
              type="text"
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. Python, AWS, Docker, FastAPI, PostgreSQL"
              className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Skills match accounts for 50 points of candidate compatibility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Eligible Departments (20 pts)
              </label>
              <div className="space-y-1.5">
                {availableDepts.map((dept) => (
                  <label key={dept} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eligibleDepartments.includes(dept)}
                      onChange={() => handleDeptToggle(dept)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Minimum CGPA Cutoff (Hard Constraint)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  placeholder="7.0"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Students below this cutoff are marked strictly ineligible.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Eligible Graduation Years
                </label>
                <div className="flex flex-wrap gap-3">
                  {['2024', '2025', '2026', '2027', '2028'].map((yr) => (
                    <label key={yr} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligibleGraduationYears.includes(yr)}
                        onChange={() => handleYearToggle(yr)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{yr}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Job Description & Responsibilities
          </h2>

          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe core responsibilities, day-to-day tasks, cloud infrastructure technologies used, and interview rounds..."
            className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Publishing Job...' : 'Publish Job Opening'}
          </button>
        </div>
      </form>
    </div>
  );
};
