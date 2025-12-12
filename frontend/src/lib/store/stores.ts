/**
 * JobForge AI - Zustand Stores
 * State management for all features
 */

import { create } from 'zustand';
import { 
  Resume, 
  Application, 
  Job,
  Interview,
  resumeService,
  applicationService,
  interviewService,
  jobService,
  analyticsService
} from '@/lib/api/services';

// ============================================
// Resume Store
// ============================================

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  isLoading: boolean;
  error: string | null;
  
  fetchResumes: () => Promise<void>;
  fetchResumeById: (id: string) => Promise<void>;
  uploadResume: (file: File, title: string) => Promise<Resume>;
  deleteResume: (id: string) => Promise<void>;
  setPrimaryResume: (id: string) => Promise<void>;
  analyzeResume: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  currentResume: null,
  isLoading: false,
  error: null,

  fetchResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const resumes = await resumeService.getAll();
      set({ resumes, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch resumes',
        isLoading: false 
      });
    }
  },

  fetchResumeById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const resume = await resumeService.getById(id);
      set({ currentResume: resume, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch resume',
        isLoading: false 
      });
    }
  },

  uploadResume: async (file: File, title: string) => {
    set({ isLoading: true, error: null });
    try {
      const resume = await resumeService.upload(file, title);
      set(state => ({ 
        resumes: [...state.resumes, resume],
        isLoading: false 
      }));
      return resume;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to upload resume',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteResume: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await resumeService.delete(id);
      set(state => ({
        resumes: state.resumes.filter(r => r.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete resume',
        isLoading: false 
      });
      throw error;
    }
  },

  setPrimaryResume: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await resumeService.setPrimary(id);
      await get().fetchResumes();
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to set primary resume',
        isLoading: false 
      });
    }
  },

  analyzeResume: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const analyzedResume = await resumeService.analyze(id);
      set(state => ({
        resumes: state.resumes.map(r => r.id === id ? analyzedResume : r),
        currentResume: state.currentResume?.id === id ? analyzedResume : state.currentResume,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to analyze resume',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));

// ============================================
// Application Store
// ============================================

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  stats: any;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    search?: string;
  };
  
  fetchApplications: () => Promise<void>;
  fetchApplicationById: (id: string) => Promise<void>;
  createApplication: (data: Partial<Application>) => Promise<Application>;
  updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
  updateStatus: (id: string, status: Application['status']) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: Partial<ApplicationState['filters']>) => void;
  clearError: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  currentApplication: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const applications = await applicationService.getAll(filters);
      set({ applications, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch applications',
        isLoading: false 
      });
    }
  },

  fetchApplicationById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const application = await applicationService.getById(id);
      set({ currentApplication: application, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch application',
        isLoading: false 
      });
    }
  },

  createApplication: async (data: Partial<Application>) => {
    set({ isLoading: true, error: null });
    try {
      const application = await applicationService.create(data);
      set(state => ({
        applications: [application, ...state.applications],
        isLoading: false
      }));
      return application;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to create application',
        isLoading: false 
      });
      throw error;
    }
  },

  updateApplication: async (id: string, data: Partial<Application>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await applicationService.update(id, data);
      set(state => ({
        applications: state.applications.map(a => a.id === id ? updated : a),
        currentApplication: state.currentApplication?.id === id ? updated : state.currentApplication,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update application',
        isLoading: false 
      });
    }
  },

  updateStatus: async (id: string, status: Application['status']) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await applicationService.updateStatus(id, status);
      set(state => ({
        applications: state.applications.map(a => a.id === id ? updated : a),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update status',
        isLoading: false 
      });
    }
  },

  deleteApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await applicationService.delete(id);
      set(state => ({
        applications: state.applications.filter(a => a.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete application',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await applicationService.getStats();
      set({ stats });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
    get().fetchApplications();
  },

  clearError: () => set({ error: null }),
}));

// ============================================
// Interview Store
// ============================================

interface InterviewState {
  interviews: any[];
  upcomingInterviews: any[];
  currentInterview: any | null;
  isLoading: boolean;
  error: string | null;
  
  fetchInterviews: () => Promise<void>;
  fetchUpcomingInterviews: () => Promise<void>;
  fetchInterviewById: (id: string) => Promise<void>;
  createInterview: (data: any) => Promise<any>;
  updateInterview: (id: string, data: any) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  clearError: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  interviews: [],
  upcomingInterviews: [],
  currentInterview: null,
  isLoading: false,
  error: null,

  fetchInterviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const { interviewService } = await import('@/lib/api/services');
      const interviews = await interviewService.getAll();
      set({ interviews, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch interviews',
        isLoading: false 
      });
    }
  },

  fetchUpcomingInterviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const { interviewService } = await import('@/lib/api/services');
      const upcomingInterviews = await interviewService.getUpcoming();
      set({ upcomingInterviews, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch upcoming interviews',
        isLoading: false 
      });
    }
  },

  fetchInterviewById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { interviewService } = await import('@/lib/api/services');
      const interview = await interviewService.getById(id);
      set({ currentInterview: interview, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch interview',
        isLoading: false 
      });
    }
  },

  createInterview: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const { interviewService } = await import('@/lib/api/services');
      const interview = await interviewService.create(data);
      set(state => ({ 
        interviews: [...state.interviews, interview],
        isLoading: false 
      }));
      return interview;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to create interview',
        isLoading: false 
      });
      throw error;
    }
  },

  updateInterview: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const { interviewService } = await import('@/lib/api/services');
      await interviewService.update(id, data);
      await get().fetchInterviews();
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update interview',
        isLoading: false 
      });
    }
  },

  deleteInterview: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { interviewService } = await import('@/lib/api/services');
      await interviewService.delete(id);
      set(state => ({
        interviews: state.interviews.filter(i => i.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to delete interview',
        isLoading: false 
      });
    }
  },

  updateStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const { interviewService } = await import('@/lib/api/services');
      await interviewService.updateStatus(id, status as any);
      await get().fetchInterviews();
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to update status',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));

// ============================================
// Job Store
// ============================================

interface JobState {
  jobs: Job[];
  matchedJobs: Array<Job & { match_score: number }>;
  bookmarkedJobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  searchParams: {
    query?: string;
    location?: string;
    remote?: boolean;
    job_type?: string;
  };
  
  searchJobs: () => Promise<void>;
  fetchMatchedJobs: (resumeId?: string) => Promise<void>;
  fetchBookmarked: () => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  bookmarkJob: (id: string) => Promise<void>;
  unbookmarkJob: (id: string) => Promise<void>;
  setSearchParams: (params: Partial<JobState['searchParams']>) => void;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  matchedJobs: [],
  bookmarkedJobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
  searchParams: {},

  searchJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { searchParams } = get();
      const jobs = await jobService.search(searchParams);
      set({ jobs, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to search jobs',
        isLoading: false 
      });
    }
  },

  fetchMatchedJobs: async (resumeId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const matchedJobs = await jobService.getMatches(resumeId);
      set({ matchedJobs, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch matched jobs',
        isLoading: false 
      });
    }
  },

  fetchBookmarked: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookmarkedJobs = await jobService.getBookmarked();
      set({ bookmarkedJobs, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch bookmarked jobs',
        isLoading: false 
      });
    }
  },

  fetchJobById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const job = await jobService.getById(id);
      set({ currentJob: job, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch job',
        isLoading: false 
      });
    }
  },

  bookmarkJob: async (id: string) => {
    try {
      await jobService.bookmark(id);
      await get().fetchBookmarked();
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to bookmark job' });
    }
  },

  unbookmarkJob: async (id: string) => {
    try {
      await jobService.unbookmark(id);
      set(state => ({
        bookmarkedJobs: state.bookmarkedJobs.filter(j => j.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to unbookmark job' });
    }
  },

  setSearchParams: (params) => {
    set(state => ({ searchParams: { ...state.searchParams, ...params } }));
  },

  clearError: () => set({ error: null }),
}));

// ============================================
// Analytics Store
// ============================================

interface AnalyticsState {
  overview: any;
  insights: any[];
  topCompanies: any[];
  isLoading: boolean;
  error: string | null;
  
  fetchOverview: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchTopCompanies: () => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overview: null,
  insights: [],
  topCompanies: [],
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const overview = await analyticsService.getOverview();
      set({ overview, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch analytics',
        isLoading: false 
      });
    }
  },

  fetchInsights: async () => {
    try {
      const insights = await analyticsService.getInsights();
      set({ insights });
    } catch (error: any) {
      console.error('Failed to fetch insights:', error);
    }
  },

  fetchTopCompanies: async () => {
    try {
      const topCompanies = await analyticsService.getTopCompanies();
      set({ topCompanies });
    } catch (error: any) {
      console.error('Failed to fetch top companies:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
