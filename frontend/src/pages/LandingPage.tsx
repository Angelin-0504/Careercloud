import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Cloud,
  Sparkles,
  Search,
  Briefcase,
  Users,
  Award,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Database,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';
import { JobCard } from '../components/cards/JobCard';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobs = await api.jobs.list({ limit: 6 });
        setFeaturedJobs(jobs);
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore-jobs?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/explore-jobs');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-indigo-50/70 via-slate-50 to-white border-b border-slate-200/60">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-800">
              Cloud-Powered Campus Placement Portal
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              AWS Ready
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Your Career Journey Starts{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              in the Cloud.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect students, corporate recruiters, and placement officers on a centralized platform with explainable rule-based skills matching and private AWS resume storage.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2.5 px-3 py-2 w-full text-slate-400">
              <Search className="w-5 h-5 text-indigo-600 shrink-0" />
              <input
                type="text"
                placeholder="Search job title, skills (e.g. Python, AWS, Docker), or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow shrink-0 cursor-pointer"
            >
              Search Jobs
            </button>
          </form>

          {/* Trending Skills Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Popular Skills:</span>
            {['Python', 'Java', 'SQL', 'React', 'AWS', 'Docker', 'Linux'].map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => navigate(`/explore-jobs?search=${encodeURIComponent(sk)}`)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer text-[11px] font-medium shadow-2xs"
              >
                {sk}
              </button>
            ))}
          </div>

          {/* Quick CTA Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs">
            {!user ? (
              <>
                <Link
                  to="/register/student"
                  className="font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1.5 bg-indigo-50/80 px-4 py-2 rounded-lg border border-indigo-100"
                >
                  <GraduationCap className="w-4 h-4" />
                  Register as Student
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/register/recruiter"
                  className="font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-2xs"
                >
                  <Building2 className="w-4 h-4" />
                  Post Campus Openings
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <Link
                to={
                  user.role === 'student'
                    ? '/student/dashboard'
                    : user.role === 'recruiter'
                    ? '/recruiter/dashboard'
                    : '/admin/dashboard'
                }
                className="font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg shadow-sm inline-flex items-center gap-2"
              >
                Go to My Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Enterprise Hiring Partners Marquee */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 max-w-5xl mx-auto">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">
              Verified Enterprise Campus Recruiters
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> AWS (Amazon)
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Microsoft
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Google Cloud
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> TCS Digital
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Infosys
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span> Accenture
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-600"></span> Cisco Systems
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span> Oracle
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center md:border-r border-slate-100">
            <div className="text-3xl font-black text-slate-900">100%</div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-1">
              Deterministic Matching
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Explainable rule-based scoring</p>
          </div>
          <div className="text-center md:border-r border-slate-100">
            <div className="text-3xl font-black text-slate-900">5 MB</div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-1">
              Private S3 Storage
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Encrypted PDF resume vault</p>
          </div>
          <div className="text-center md:border-r border-slate-100">
            <div className="text-3xl font-black text-slate-900">3 Roles</div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-1">
              Role-Based Access
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Students, Recruiters, Officers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-600">AWS Ready</div>
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mt-1">
              Cloud Architecture
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">App Runner + RDS PostgreSQL</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Cloud Placement Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            How CareerCloud Connects Campuses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A seamless, transparent 4-stage recruitment lifecycle from profile creation to final placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-base mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">Create Profile & Resume</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Students record academic metrics (CGPA, department, graduation year), technical skills, and upload an encrypted PDF resume.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 font-black text-base mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">Cloud-Native Matching</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our rule-based engine evaluates candidate skills (50%), department (20%), CGPA (15%), and graduation year (15%) with transparent scoring.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-base mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">1-Click Application</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Eligible students apply directly with instantaneous duplicate prevention. Recruiters are automatically notified of compatible candidates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black text-base mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">Interview & Selection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recruiters manage the interview pipeline. Final selections automatically record institutional placement records and package metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Opportunities
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
              Featured Campus Openings
            </h2>
          </div>
          <Link
            to="/explore-jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
          >
            View All Jobs
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-slate-200/60 animate-pulse"></div>
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No active job postings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Skills-Based Matching Highlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                Explainable Matching Algorithm
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                No Black Boxes. Full Transparency for Students and Recruiters.
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Unlike opaque AI claims that offer no explanation, CareerCloud calculates a deterministic 100-point compatibility score with clear mathematical accountability:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">50% Skills Match Weight</h4>
                    <p className="text-[11px] text-slate-400">
                      Calculates the exact ratio of required technical skills possessed by the student candidate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">20% Department Alignment</h4>
                    <p className="text-[11px] text-slate-400">
                      Evaluates degree qualification and academic department compatibility.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">30% Academic & Batch Fit</h4>
                    <p className="text-[11px] text-slate-400">
                      Evaluates minimum CGPA and graduation year eligibility with transparent match criteria.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Algorithm Card Mockup */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold text-slate-300">Live Calculation Preview</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  92% Strong Match
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Skills Score (Python, AWS, Docker)</span>
                  <span className="font-bold text-white">50.0 / 50 pts</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full w-full"></div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Department (Computer Science)</span>
                  <span className="font-bold text-white">20.0 / 20 pts</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full w-full"></div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>CGPA (8.85 &gt;= 7.50 Min)</span>
                  <span className="font-bold text-white">15.0 / 15 pts</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-full"></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                <span className="text-emerald-400 font-bold">Explanation: </span>
                Candidate satisfies all hard constraints. Strong technical skills alignment with Docker and AWS infrastructure.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Target Audiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Built for Every Campus Placement Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Students */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For University Students</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Personalized job matches with compatibility badges</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Encrypted PDF resume upload and replacement</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time status updates (Shortlisted, Interview, Offer)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Job shortlisting and in-app notifications</span>
              </li>
            </ul>
          </div>

          {/* Recruiters */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Corporate Recruiters</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fast campus job postings with custom CGPA criteria</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Access verified applicant profiles and download authorized resumes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Manage interview rounds and candidate status progression</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Recruitment analytics and applicant conversion statistics</span>
              </li>
            </ul>
          </div>

          {/* Placement Officers */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Placement Officers</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time platform dashboard with institutional placement rate</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Department-wise placement charts and monthly trends</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verify registered companies and moderate active listings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>One-click CSV exports for accreditation and placement reports</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
