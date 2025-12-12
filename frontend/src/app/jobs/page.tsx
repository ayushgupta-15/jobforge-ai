'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, ExternalLink, BookmarkPlus, Loader2 } from 'lucide-react';
import { useJobStore } from '@/lib/store/stores';

export default function JobsPage() {
  const { jobs, isLoading, searchJobs, setSearchParams } = useJobStore();

  useEffect(() => {
    searchJobs();
  }, [searchJobs]);

  if (isLoading && jobs.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Job Listings</h1>
            <p className="text-slate-600">Browse and apply to job opportunities</p>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Briefcase className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No jobs available</h3>
                <p className="text-slate-600 mb-4">Check back later for new opportunities</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>{job.company}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <BookmarkPlus className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-4 text-sm text-slate-600">
                        <span>{job.location}</span>
                        {job.remote_type && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{job.remote_type}</span>}
                      </div>
                      <p className="text-sm line-clamp-2">{job.description}</p>
                      {job.salary_min && job.salary_max && (
                        <div className="text-sm text-green-600 font-semibold">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4">
                        <div className="text-xs text-slate-500">
                          Posted {new Date(job.posted_date || job.created_at).toLocaleDateString()}
                        </div>
                        <Button variant="default" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
