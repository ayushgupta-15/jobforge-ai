/**
 * Jobs API Client
 */

const JOBS_API_URL =
  process.env.NEXT_PUBLIC_GO_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote_type?: string;
  description: string;
  requirements?: string;
  raw_description?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  source_url?: string;
  validated_source_url?: string;
  source_site?: string;
  is_active: boolean;
  posted_date?: string;
  ai_summary?: string;
  ai_highlights?: string[];
  ai_required_skills?: string[];
  ai_compensation?: string;
  ai_remote_policy?: string;
  ai_last_enriched_at?: string;
  created_at: string;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  remote?: boolean;
  job_type?: string;
  min_salary?: number;
  max_salary?: number;
  page?: number;
  limit?: number;
}

export interface JobSearchResponse {
  jobs: Job[];
  count: number;
  page: number;
  limit: number;
}

export interface ScraperStatus {
  is_running: boolean;
  last_run: string;
  jobs_scraped: number;
  successful_sites: string[];
  failed_sites: string[];
}

class JobsAPIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = JOBS_API_URL;
  }

  /**
   * Search for jobs
   */
  async searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
    const queryParams = new URLSearchParams();

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const searchTerm = [params.query, params.location].filter(Boolean).join(' ').trim();

    queryParams.append('skip', skip.toString());
    queryParams.append('limit', limit.toString());

    const url = searchTerm
      ? `${this.baseURL}/api/v1/jobs/search?${queryParams.toString()}&q=${encodeURIComponent(searchTerm)}`
      : `${this.baseURL}/api/v1/jobs?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const jobs = Array.isArray(data) ? data : data.jobs || [];
      const filteredJobs = params.remote
        ? jobs.filter((job: Job) => {
            const remoteText = [
              job.remote_type,
              job.ai_remote_policy,
              job.location,
            ].filter(Boolean).join(' ').toLowerCase();
            return remoteText.includes('remote');
          })
        : jobs;

      return {
        jobs: filteredJobs,
        count: Array.isArray(data) ? filteredJobs.length : data.count || filteredJobs.length,
        page: Array.isArray(data) ? page : data.page || page,
        limit: Array.isArray(data) ? limit : data.limit || limit,
      };
    } catch (error) {
      console.error('Job search error:', error);
      throw error;
    }
  }

  /**
   * Get a single job by ID
   */
  async getJob(id: string): Promise<Job> {
    const url = `${this.baseURL}/api/v1/jobs/${id}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get job error:', error);
      throw error;
    }
  }

  /**
   * Get scraper status
   */
  async getScraperStatus(): Promise<ScraperStatus> {
    const url = `${this.baseURL}/api/v1/scraper/status`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scraper status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get scraper status error:', error);
      throw error;
    }
  }

  /**
   * Trigger manual scrape (requires auth)
   */
  async triggerScrape(accessToken: string): Promise<{ message: string; status: string }> {
    const url = `${this.baseURL}/api/v1/jobs/scrape`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Scrape trigger failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Trigger scrape error:', error);
      throw error;
    }
  }

  /**
   * Check if Go backend is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const jobsAPI = new JobsAPIClient();
