export type UserRole = 'student' | 'recruiter' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  company_id?: number | null;
  student_id?: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Resume {
  id: number;
  file_name: string;
  file_size_bytes: number;
  content_type: string;
  uploaded_at: string;
  download_url?: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  phone?: string;
  department: string;
  degree: string;
  graduation_year: number;
  cgpa: number;
  skills: string;
  certifications?: string;
  projects?: string;
  experience?: string;
  bio?: string;
  profile_completed_percentage: number;
  updated_at: string;
  resumes: Resume[];
  full_name?: string;
  email?: string;
  user?: User;
}

export interface Company {
  id: number;
  name: string;
  logo_url?: string;
  description?: string;
  industry: string;
  website?: string;
  location: string;
  is_verified: boolean;
  created_at: string;
  active_jobs_count?: number;
}

export interface RecruiterProfile {
  id: number;
  user_id: number;
  company_id?: number;
  designation?: string;
  phone?: string;
  company?: Company;
}

export interface MatchScoreDetails {
  match_score: number;
  is_eligible: boolean;
  matched_skills: string[];
  missing_skills: string[];
  ineligibility_reasons: string[];
  skills_score: number;
  dept_score: number;
  cgpa_score: number;
  grad_score: number;
  explanation: string;
}

export interface Job {
  id: number;
  company_id: number;
  posted_by_user_id?: number;
  title: string;
  description: string;
  job_type: string;
  location: string;
  salary_range?: string;
  min_cgpa: number;
  eligible_departments: string;
  eligible_graduation_years: string;
  required_skills: string;
  application_deadline?: string;
  status: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  applicants_count: number;
  has_applied?: boolean;
  is_saved?: boolean;
  match_details?: MatchScoreDetails;
}

export interface Application {
  id: number;
  student_id: number;
  job_id: number;
  status: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected' | 'Withdrawn';
  applied_at: string;
  updated_at: string;
  notes?: string;
  job?: Job;
  student?: StudentProfile;
}

export interface SavedJob {
  id: number;
  student_id: number;
  job_id: number;
  created_at: string;
  job?: Job;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface DepartmentStat {
  department: string;
  total_students: number;
  placed_students: number;
  placement_rate: number;
}

export interface CompanyStat {
  company_name: string;
  placements_count: number;
  avg_package_lpa?: number;
}

export interface MonthlyTrend {
  month: string;
  applications: number;
  selections: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  resource_type: string;
  details?: string;
  created_at: string;
  user_name?: string;
}

export interface AdminDashboardStats {
  total_students: number;
  total_companies: number;
  total_jobs: number;
  total_applications: number;
  total_placed: number;
  placement_rate: number;
  department_stats: DepartmentStat[];
  company_stats: CompanyStat[];
  monthly_trends: MonthlyTrend[];
  recent_activities: RecentActivity[];
}

export interface RecruiterDashboardStats {
  total_jobs_posted: number;
  active_jobs: number;
  total_applicants: number;
  shortlisted_count: number;
  selected_count: number;
  recent_applications: any[];
}

export interface StudentDashboardStats {
  profile_completion: number;
  total_applied: number;
  shortlisted: number;
  interviews: number;
  selected: number;
  saved_jobs_count: number;
  recommended_jobs_count: number;
}
