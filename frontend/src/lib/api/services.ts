/**
 * JobForge AI - Complete API Services
 * All API calls organized by feature
 */

import apiClient from './client';

// ============================================
// Types & Interfaces
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile_picture_url?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  email_verified: boolean;
  is_active: boolean;
  subscription_tier: string;
  created_at: string;
  last_login_at?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_url?: string;
  file_type?: string;
  is_primary: boolean;
  raw_text?: string;
  ats_score?: number;
  keyword_match_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id?: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  status: 'draft' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'accepted';
  applied_date?: string;
  source?: string;
  notes?: string;
  match_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote_type?: string;
  description: string;
  requirements?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  source_url?: string;
  is_active: boolean;
  posted_date?: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  category?: string;
  subject: string;
  body: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EmailSchedule {
  id: string;
  user_id: string;
  application_id?: string;
  template_id?: string;
  to_email: string;
  subject: string;
  body: string;
  send_at: string;
  status: 'pending' | 'sent' | 'failed' | 'canceled';
  last_error?: string;
  sent_at?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================
// User & Profile Service
// ============================================

class UserService {
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/api/v1/users/me', data);
    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/v1/users/me/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  async getPreferences(): Promise<any> {
    const response = await apiClient.get('/api/v1/users/me/preferences');
    return response.data;
  }

  async updatePreferences(preferences: any): Promise<any> {
    const response = await apiClient.put('/api/v1/users/me/preferences', preferences);
    return response.data;
  }
}

// ============================================
// Resume Service
// ============================================

class ResumeService {
  async getAll(): Promise<Resume[]> {
    const response = await apiClient.get<Resume[]>('/api/v1/resumes');
    return response.data;
  }

  async getById(id: string): Promise<Resume> {
    const response = await apiClient.get<Resume>(`/api/v1/resumes/${id}`);
    return response.data;
  }

  async upload(file: File, title: string): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const response = await apiClient.post<Resume>('/api/v1/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async update(id: string, data: Partial<Resume>): Promise<Resume> {
    const response = await apiClient.put<Resume>(`/api/v1/resumes/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/resumes/${id}`);
  }

  async setPrimary(id: string): Promise<Resume> {
    const response = await apiClient.post<Resume>(`/api/v1/resumes/${id}/set-primary`);
    return response.data;
  }

  async analyze(id: string): Promise<Resume> {
    const response = await apiClient.post<Resume>(`/api/v1/resumes/${id}/analyze`);
    return response.data;
  }

  async download(id: string): Promise<Blob> {
    const response = await apiClient.get(`/api/v1/resumes/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

// ============================================
// Application Service
// ============================================

class ApplicationService {
  async getAll(params?: {
    status?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<Application[]> {
    const response = await apiClient.get<Application[]>('/api/v1/applications', { params });
    return response.data;
  }

  async getById(id: string): Promise<Application> {
    const response = await apiClient.get<Application>(`/api/v1/applications/${id}`);
    return response.data;
  }

  async create(data: Partial<Application>): Promise<Application> {
    const response = await apiClient.post<Application>('/api/v1/applications', data);
    return response.data;
  }

  async update(id: string, data: Partial<Application>): Promise<Application> {
    const response = await apiClient.put<Application>(`/api/v1/applications/${id}`, data);
    return response.data;
  }

  async updateStatus(id: string, status: Application['status']): Promise<Application> {
    const response = await apiClient.patch<Application>(
      `/api/v1/applications/${id}/status`,
      { status }
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/applications/${id}`);
  }

  async getStats(): Promise<{
    total: number;
    by_status: Record<string, number>;
    response_rate: number;
    interview_rate: number;
  }> {
    const response = await apiClient.get('/api/v1/applications/stats');
    return response.data;
  }
}

// ============================================
// Interview Service
// ============================================

export interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  interview_type: 'phone' | 'video' | 'in_person' | 'panel';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string;
  duration_minutes?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  location_or_url?: string;
  notes?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

class InterviewService {
  async getAll(): Promise<Interview[]> {
    const response = await apiClient.get<Interview[]>('/api/v1/interviews');
    return response.data;
  }

  async getById(id: string): Promise<Interview> {
    const response = await apiClient.get<Interview>(`/api/v1/interviews/${id}`);
    return response.data;
  }

  async getUpcoming(): Promise<Interview[]> {
    const response = await apiClient.get<Interview[]>('/api/v1/interviews/upcoming');
    return response.data;
  }

  async create(data: Partial<Interview>): Promise<Interview> {
    const response = await apiClient.post<Interview>('/api/v1/interviews', data);
    return response.data;
  }

  async update(id: string, data: Partial<Interview>): Promise<Interview> {
    const response = await apiClient.put<Interview>(`/api/v1/interviews/${id}`, data);
    return response.data;
  }

  async updateStatus(id: string, status: Interview['status']): Promise<Interview> {
    const response = await apiClient.patch<Interview>(
      `/api/v1/interviews/${id}/status`,
      { status }
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/interviews/${id}`);
  }
}

// ============================================
// Job Service
// ============================================

class JobService {
  async search(params?: {
    query?: string;
    location?: string;
    remote?: boolean;
    job_type?: string;
    skip?: number;
    limit?: number;
  }): Promise<Job[]> {
    const response = await apiClient.get<Job[]>('/api/v1/jobs/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<Job> {
    const response = await apiClient.get<Job>(`/api/v1/jobs/${id}`);
    return response.data;
  }

  async getMatches(resumeId?: string): Promise<Array<Job & { match_score: number }>> {
    const response = await apiClient.get('/api/v1/jobs/matches', {
      params: { resume_id: resumeId },
    });
    return response.data;
  }

  async bookmark(jobId: string): Promise<void> {
    await apiClient.post(`/api/v1/jobs/${jobId}/bookmark`);
  }

  async unbookmark(jobId: string): Promise<void> {
    await apiClient.delete(`/api/v1/jobs/${jobId}/bookmark`);
  }

  async getBookmarked(): Promise<Job[]> {
    const response = await apiClient.get<Job[]>('/api/v1/jobs/bookmarked');
    return response.data;
  }
}

// ============================================
// Analytics Service
// ============================================

export interface AnalyticsOverview {
  total_applications: number;
  response_rate: number;
  interview_rate: number;
  avg_response_time_days: number;
  applications_by_status: Record<string, number>;
  applications_by_month: Array<{ month: string; count: number }>;
}

export interface AnalyticsInsight {
  type: 'strength' | 'tip' | 'opportunity';
  message: string;
}

export interface TopCompany {
  company: string;
  application_count: number;
}

class AnalyticsService {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await apiClient.get<AnalyticsOverview>('/api/v1/analytics/overview');
    return response.data;
  }

  async getInsights(): Promise<AnalyticsInsight[]> {
    const response = await apiClient.get<AnalyticsInsight[]>('/api/v1/analytics/insights');
    return response.data;
  }

  async getTopCompanies(): Promise<TopCompany[]> {
    const response = await apiClient.get<TopCompany[]>('/api/v1/analytics/top-companies');
    return response.data;
  }
}

// ============================================
// Email Automation Service
// ============================================

class EmailService {
  async getTemplates(): Promise<EmailTemplate[]> {
    const response = await apiClient.get<EmailTemplate[]>('/api/v1/email/templates');
    return response.data;
  }

  async createTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await apiClient.post<EmailTemplate>('/api/v1/email/templates', data);
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await apiClient.put<EmailTemplate>(`/api/v1/email/templates/${id}`, data);
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/email/templates/${id}`);
  }

  async getSchedules(): Promise<EmailSchedule[]> {
    const response = await apiClient.get<EmailSchedule[]>('/api/v1/email/schedules');
    return response.data;
  }

  async updateSchedule(id: string, data: Partial<EmailSchedule>): Promise<EmailSchedule> {
    const response = await apiClient.patch<EmailSchedule>(`/api/v1/email/schedules/${id}`, data);
    return response.data;
  }

  async cancelSchedule(id: string): Promise<EmailSchedule> {
    const response = await apiClient.post<EmailSchedule>(`/api/v1/email/schedules/${id}/cancel`);
    return response.data;
  }

  async sendEmail(data: {
    to_email: string;
    subject?: string;
    body?: string;
    template_id?: string;
    application_id?: string;
    variables?: Record<string, any>;
    send_at?: string;
  }): Promise<{ schedule_id: string; status: string; sent_at?: string }> {
    const response = await apiClient.post('/api/v1/email/send', data);
    return response.data;
  }
}

// ============================================
// AI Service
// ============================================

class AIService {
  async generateCoverLetter(data: {
    resume_id: string;
    job_id?: string;
    tone?: string;
    length?: string;
    custom_notes?: string;
  }): Promise<{
    letter: string;
    model: string;
    prompt_tokens?: number;
    completion_tokens?: number;
  }> {
    const response = await apiClient.post('/api/v1/ai/cover-letter', data);
    return response.data;
  }

  async generateInterviewQuestions(data: {
    job_id: string;
    interview_type: 'technical' | 'behavioral' | 'system_design';
    seniority?: string;
    focus_areas?: string[];
  }): Promise<{
    job_id: string;
    interview_type: string;
    questions: Array<{ question: string; guidance?: string | null }>;
    model: string;
    prompt_tokens?: number;
    completion_tokens?: number;
  }> {
    const response = await apiClient.post('/api/v1/ai/interview/questions', data);
    return response.data;
  }

  async chat(message: string, context?: any): Promise<{ response: string }> {
    const response = await apiClient.post('/api/v1/ai/chat', { message, context });
    return response.data;
  }
}

// ============================================
// Export Services
// ============================================

export const userService = new UserService();
export const resumeService = new ResumeService();
export const applicationService = new ApplicationService();
export const interviewService = new InterviewService();
export const jobService = new JobService();
export const analyticsService = new AnalyticsService();
export const aiService = new AIService();
export const emailService = new EmailService();

// Export all services as default
export default {
  user: userService,
  resume: resumeService,
  application: applicationService,
  interview: interviewService,
  job: jobService,
  analytics: analyticsService,
  ai: aiService,
  email: emailService,
};
