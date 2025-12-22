'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Bookmark,
  ExternalLink,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import { jobsAPI, Job, JobSearchParams } from '@/lib/api/jobs';
import { useToast } from '@/hooks/use-toast';
import { aiService, resumeService, Resume } from '@/lib/api/services';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthy, setIsHealthy] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<Record<string, string>>({});
  const [coverLetterLoading, setCoverLetterLoading] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    query: '',
    location: '',
    remote: false,
    page: 1,
    limit: 20,
  });
  const { toast } = useToast();

  // Check Go backend health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const healthy = await jobsAPI.healthCheck();
    setIsHealthy(healthy);
    if (!healthy) {
      toast({
        title: 'Backend Unavailable',
        description: 'Go backend is not running. Please start it first.',
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      fetchJobs(undefined, true);
    }
  };

  const fetchJobs = async (params: JobSearchParams = searchParams, force = false) => {
    if (!isHealthy && !force) return;

    setIsLoading(true);
    try {
      const response = await jobsAPI.searchJobs(params);
      setJobs(response.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: 'Failed to fetch jobs',
        description: 'Please make sure the Go backend is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const updatedParams = { ...searchParams, page: 1 };
    setSearchParams(updatedParams);
    fetchJobs(updatedParams);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRemoteFilter = (remoteOnly: boolean) => {
    const updatedParams = { ...searchParams, remote: remoteOnly, page: 1 };
    setSearchParams(updatedParams);
    fetchJobs(updatedParams);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    const currentPage = searchParams.page || 1;
    const nextPage = direction === 'prev' ? Math.max(1, currentPage - 1) : currentPage + 1;
    const updatedParams = { ...searchParams, page: nextPage };
    setSearchParams(updatedParams);
    fetchJobs(updatedParams);
  };

  const loadResumes = async () => {
    if (resumes.length > 0) return resumes;
    try {
      const data = await resumeService.getAll();
      setResumes(data);
      return data;
    } catch (error) {
      console.error('Failed to load resumes', error);
      toast({
        title: 'Login required',
        description: 'Sign in to load your resumes before generating cover letters.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const generateCoverLetter = async (job: Job) => {
    const availableResumes = await loadResumes();
    const targetResume = availableResumes.find((r) => r.is_primary) || availableResumes[0];
    if (!targetResume) {
      toast({
        title: 'No resume found',
        description: 'Upload a resume to your account to generate cover letters.',
        variant: 'destructive',
      });
      return;
    }

    setCoverLetterLoading(job.id);
    try {
      const result = await aiService.generateCoverLetter({
        resume_id: targetResume.id,
        job_id: job.id,
        tone: 'professional',
        length: 'medium',
      });
      setCoverLetters((prev) => ({ ...prev, [job.id]: result.letter }));
      toast({
        title: 'Cover letter ready',
        description: 'Generated using your saved resume.',
      });
    } catch (error) {
      console.error('Cover letter generation failed', error);
      toast({
        title: 'Cover letter failed',
        description: 'Check that you are signed in to the AI backend and try again.',
        variant: 'destructive',
      });
    } finally {
      setCoverLetterLoading(null);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
  };

  const getCompensationLabel = (job: Job) => {
    if (job.ai_compensation) {
      return job.ai_compensation;
    }
    return formatSalary(job.salary_min, job.salary_max);
  };

  const getDescription = (job: Job) => job.ai_summary || job.description;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Job Search
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Browse scraped jobs from RemoteOK and WeWorkRemotely
            </p>
          </div>

          {/* Backend Status Alert */}
          {!isHealthy && (
            <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-400">
                      Go Backend Not Running
                    </p>
                    <p className="text-sm text-orange-800 dark:text-orange-300">
                      Please start the Go backend: <code className="bg-orange-100 px-2 py-1 rounded">cd backend-go && make run</code>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkHealth}
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for jobs, companies, or skills..."
                value={searchParams.query}
                onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                onKeyDown={handleKeyPress}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="relative w-64">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Location"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                onKeyDown={handleKeyPress}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button onClick={handleSearch} size="lg" disabled={!isHealthy}>
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mb-8">
            <Button 
              variant={!searchParams.remote ? "default" : "outline"} 
              size="sm"
              onClick={() => handleRemoteFilter(false)}
            >
              All Jobs
            </Button>
            <Button 
              variant={searchParams.remote ? "default" : "outline"} 
              size="sm"
              onClick={() => handleRemoteFilter(true)}
            >
              Remote Only
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-slate-600">Loading jobs...</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && jobs.length > 0 && (
            <div className="mb-4">
              <p className="text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{jobs.length}</span> jobs
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && jobs.length === 0 && isHealthy && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Briefcase className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try adjusting your search criteria
                </p>
              </CardContent>
            </Card>
          )}

          {/* Job Listings */}
          {!isLoading && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          {job.remote_type && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              {job.remote_type}
                            </Badge>
                          )}
                          {job.source_site && (
                            <Badge variant="outline" className="text-xs uppercase tracking-wide">
                              {job.source_site}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">{job.company}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      {job.job_type && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {job.job_type}
                        </div>
                      )}
                      {getCompensationLabel(job) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {getCompensationLabel(job)}
                        </div>
                      )}
                      {job.ai_remote_policy && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {job.ai_remote_policy}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {getTimeAgo(job.created_at)}
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
                      {getDescription(job)}
                    </p>

                    {job.ai_highlights && job.ai_highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.ai_highlights.slice(0, 4).map((highlight, idx) => (
                          <Badge key={`${job.id}-highlight-${idx}`} variant="outline" className="bg-slate-50 dark:bg-slate-800/60">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {job.ai_required_skills && job.ai_required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.ai_required_skills.slice(0, 6).map((skill, idx) => (
                          <Badge key={`${job.id}-skill-${idx}`} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button>
                        Apply Now
                      </Button>
                      {(job.validated_source_url || job.source_url) && (
                        <Button variant="outline" asChild>
                          <a href={job.validated_source_url || job.source_url!} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Original
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => generateCoverLetter(job)}
                        disabled={!!coverLetterLoading}
                      >
                        {coverLetterLoading === job.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 h-4 w-4" />
                        )}
                        Cover Letter
                      </Button>
                    </div>
                    {coverLetters[job.id] && (
                      <div className="mt-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/40">
                        <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-200">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-semibold">Generated Cover Letter</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                          {coverLetters[job.id]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && jobs.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange('prev')}
                disabled={(searchParams.page || 1) === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {searchParams.page}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange('next')}
                disabled={jobs.length < (searchParams.limit || 20)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
