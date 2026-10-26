const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('careercloud_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  // Handle blob/download responses
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('text/csv') || contentType.includes('application/pdf'))) {
    if (!response.ok) {
      throw new ApiError('File download failed', response.status);
    }
    return (await response.blob()) as unknown as T;
  }

  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    data = { detail: 'Unexpected response from server' };
  }

  if (!response.ok) {
    const errorMsg = data?.detail || (typeof data === 'string' ? data : 'Request failed');
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => request<any>('/auth/me'),
  },

  // Students
  students: {
    getProfile: () => request<any>('/students/me'),
    updateProfile: (profileData: any) =>
      request<any>('/students/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    getDashboard: () => request<any>('/students/dashboard'),
  },

  // Recruiters
  recruiters: {
    getProfile: () => request<any>('/recruiters/me'),
    updateCompany: (companyData: any) =>
      request<any>('/recruiters/company', {
        method: 'PUT',
        body: JSON.stringify(companyData),
      }),
    getDashboard: () => request<any>('/recruiters/dashboard'),
  },

  // Jobs
  jobs: {
    list: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
      const qStr = query.toString();
      return request<any[]>(`/jobs${qStr ? `?${qStr}` : ''}`);
    },
    getRecommendations: () => request<any[]>('/jobs/recommendations'),
    getById: (id: number) => request<any>(`/jobs/${id}`),
    create: (jobData: any) =>
      request<any>('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      }),
    update: (id: number, jobData: any) =>
      request<any>(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      }),
    delete: (id: number) =>
      request<any>(`/jobs/${id}`, {
        method: 'DELETE',
      }),
  },

  // Applications & Shortlisting
  applications: {
    apply: (jobId: number, notes?: string) =>
      request<any>('/applications', {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId, notes }),
      }),
    getMyApplications: () => request<any[]>('/applications/my'),
    getJobApplicants: (jobId: number) => request<any[]>(`/applications/job/${jobId}`),
    updateStatus: (appId: number, status: string, notes?: string) =>
      request<any>(`/applications/${appId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      }),
    saveJob: (jobId: number) =>
      request<any>(`/applications/save-job/${jobId}`, {
        method: 'POST',
      }),
    removeSavedJob: (jobId: number) =>
      request<any>(`/applications/save-job/${jobId}`, {
        method: 'DELETE',
      }),
    getSavedJobs: () => request<any[]>('/applications/saved'),
  },

  // Resumes
  resumes: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<any>('/resumes/upload', {
        method: 'POST',
        body: formData,
      });
    },
    downloadUrl: (resumeId: number) => `/api/v1/resumes/${resumeId}/download`,
    delete: (resumeId: number) =>
      request<any>(`/resumes/${resumeId}`, {
        method: 'DELETE',
      }),
  },

  // Notifications
  notifications: {
    list: () => request<any[]>('/notifications'),
    markRead: (id: number) =>
      request<any>(`/notifications/${id}/read`, {
        method: 'PUT',
      }),
    markAllRead: () =>
      request<any>('/notifications/read-all', {
        method: 'PUT',
      }),
  },

  // Placement Officer & Admin
  admin: {
    getDashboard: () => request<any>('/admin/dashboard'),
    listStudents: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
      const qStr = query.toString();
      return request<any[]>(`/admin/students${qStr ? `?${qStr}` : ''}`);
    },
    listRecruiters: () => request<any[]>('/admin/recruiters'),
    toggleCompanyVerify: (companyId: number) =>
      request<any>(`/admin/companies/${companyId}/verify`, {
        method: 'PUT',
      }),
    toggleJobFlag: (jobId: number) =>
      request<any>(`/admin/jobs/${jobId}/flag`, {
        method: 'PUT',
      }),
    getAuditLogs: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      return request<any[]>(`/admin/audit-logs${query ? `?${query}` : ''}`);
    },
    exportPlacementsCsv: () => request<Blob>('/admin/export/placements-csv'),
    exportStudentsCsv: () => request<Blob>('/admin/export/students-csv'),
  },
};
