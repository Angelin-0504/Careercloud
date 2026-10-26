import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterStudentPage } from './pages/RegisterStudentPage';
import { RegisterRecruiterPage } from './pages/RegisterRecruiterPage';
import { JobDiscoveryPage } from './pages/JobDiscoveryPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage';
import { SavedJobsPage } from './pages/student/SavedJobsPage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { PostJobPage } from './pages/recruiter/PostJobPage';
import { ManageJobsPage } from './pages/recruiter/ManageJobsPage';
import { ApplicantsPage } from './pages/recruiter/ApplicantsPage';
import { CompanyProfilePage } from './pages/recruiter/CompanyProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageStudentsPage } from './pages/admin/ManageStudentsPage';
import { ManageRecruitersPage } from './pages/admin/ManageRecruitersPage';
import { ManageJobsAdminPage } from './pages/admin/ManageJobsAdminPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register/student" element={<RegisterStudentPage />} />
                <Route path="/register/recruiter" element={<RegisterRecruiterPage />} />
                <Route path="/explore-jobs" element={<JobDiscoveryPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/architecture" element={<ArchitecturePage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/applications"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <MyApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/saved"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <SavedJobsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Recruiter Protected Routes */}
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/post-job"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <PostJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <ManageJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/applicants"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <ApplicantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/company"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter']}>
                      <CompanyProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageStudentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/recruiters"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageRecruitersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/jobs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageJobsAdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Error & Fallback Routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
