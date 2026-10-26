import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  User as UserIcon,
  Award,
  Calendar,
  Phone,
  Briefcase,
  Shield,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudentProfile, Resume } from '../../types';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [cgpa, setCgpa] = useState<number>(8.0);
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState('');
  const [projects, setProjects] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data: StudentProfile = await api.students.getProfile();
      setProfile(data);
      setPhone(data.phone || '');
      setDepartment(data.department || 'Computer Science & Engineering');
      setDegree(data.degree || 'B.Tech');
      setGraduationYear(data.graduation_year || 2026);
      setCgpa(data.cgpa || 8.0);
      setCertifications(data.certifications || '');
      setProjects(data.projects || '');
      setExperience(data.experience || '');
      setBio(data.bio || '');

      const parsedSkills = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      setSkillsList(parsedSkills);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await api.students.updateProfile({
        phone,
        department,
        degree,
        graduation_year: graduationYear,
        cgpa,
        skills: skillsList.join(', '),
        certifications,
        projects,
        experience,
        bio,
      });
      setProfile(updated);
      setFeedback({ type: 'success', text: 'Profile updated successfully! Match scores recalculated.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setFeedback({ type: 'error', text: 'Only PDF documents (.pdf) are allowed.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'File exceeds maximum size limit of 5 MB.' });
      return;
    }

    setUploading(true);
    setFeedback(null);
    try {
      const newResume = await api.resumes.upload(file);
      setFeedback({ type: 'success', text: `Resume '${file.name}' uploaded and encrypted to storage.` });
      // Reload profile to refresh resumes and completion %
      await loadProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Resume upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.resumes.delete(resumeId);
      setFeedback({ type: 'success', text: 'Resume deleted.' });
      await loadProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete resume.' });
    }
  };

  const handleDownloadResume = async (resumeId: number, fileName: string) => {
    try {
      const token = localStorage.getItem('careercloud_token');
      const response = await fetch(`/api/v1/resumes/${resumeId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed or unauthorized');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to download resume.' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Profile & Resume Management
          </h1>
          <p className="text-xs text-slate-500">
            Keep your credentials up to date to maximize match scores and placement eligibility
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
          <span className="text-xs font-semibold text-slate-700">Profile Readiness:</span>
          <span className="text-xs font-bold text-indigo-700">
            {profile?.profile_completed_percentage || 0}%
          </span>
        </div>
      </div>

      {/* Feedback banner */}
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

      {/* SECTION 1: Resume Upload & Vault */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Encrypted Resume Storage (PDF Only)
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Private Storage (S3 / Local Vault)
          </div>
        </div>

        {/* Upload Drop Area */}
        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-6 text-center space-y-3 transition-colors bg-slate-50/50">
          <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-700">
              Upload your official PDF resume (Max 5 MB)
            </p>
            <p className="text-[11px] text-slate-400">
              Resumes remain private and are only accessible by authorized recruiters whose jobs you apply to.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? 'Validating & Uploading...' : 'Browse PDF Document'}
          </label>
        </div>

        {/* Uploaded Resumes List */}
        {profile?.resumes && profile.resumes.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-600">Active Uploaded Resumes:</span>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {profile.resumes.map((resume: Resume) => (
                <div
                  key={resume.id}
                  className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{resume.file_name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {(resume.file_size_bytes / 1024).toFixed(1)} KB • Uploaded on{' '}
                        {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadResume(resume.id, resume.file_name)}
                      className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-100 inline-flex items-center gap-1 font-semibold text-xs"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(resume.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-100"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Academic & Skills Information Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Academic Credentials & Criteria
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Degree Program
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                min="2020"
                max="2035"
                required
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cumulative CGPA (0 - 10)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Interactive Skills Chip Editor */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              Technical Skills (Weighted at 50% in Matching Engine)
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Type skill (e.g. AWS, Docker, React, Python) and press Add..."
                className="flex-1 px-3.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Projects & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Key Projects
              </label>
              <textarea
                rows={3}
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                placeholder="e.g. Cloud-Based Placement Portal on AWS, Distributed Task Queue..."
                className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Certifications
              </label>
              <textarea
                rows={3}
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. AWS Certified Cloud Practitioner, HashiCorp Terraform Associate..."
                className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Personal Bio / Summary
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Aspiring Cloud Solutions Architect with hands-on experience in containerization and full-stack web development..."
              className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
