'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Briefcase, 
  Calendar, 
  TrendingUp 
} from 'lucide-react';
import { useResumeStore, useApplicationStore, useInterviewStore } from '@/lib/store/stores';

export default function DashboardPage() {
  const { resumes, fetchResumes } = useResumeStore();
  const { applications, stats, fetchApplications } = useApplicationStore();
  const { upcomingInterviews, fetchUpcomingInterviews } = useInterviewStore();

  useEffect(() => {
    fetchResumes();
    fetchApplications();
    fetchUpcomingInterviews();
  }, [fetchResumes, fetchApplications, fetchUpcomingInterviews]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumes.length}</div>
              <p className="text-xs text-muted-foreground">{resumes.filter(r => r.is_primary).length} primary</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(stats?.by_status?.applied || 0) + (stats?.by_status?.screening || 0)} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingInterviews.length}</div>
              <p className="text-xs text-muted-foreground">upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total ? Math.round((stats.by_status?.offer || 0) / stats.total * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{stats?.by_status?.offer || 0} offers</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with JobForge AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="h-auto py-6 flex-col items-start" variant="outline">
                <FileText className="h-5 w-5 mb-2" />
                <span className="font-semibold">Upload Resume</span>
                <span className="text-xs text-muted-foreground">Get AI-powered analysis</span>
              </Button>

              <Button className="h-auto py-6 flex-col items-start" variant="outline">
                <Briefcase className="h-5 w-5 mb-2" />
                <span className="font-semibold">Track Application</span>
                <span className="text-xs text-muted-foreground">Add a new job application</span>
              </Button>

              <Button className="h-auto py-6 flex-col items-start" variant="outline">
                <Calendar className="h-5 w-5 mb-2" />
                <span className="font-semibold">Schedule Interview</span>
                <span className="text-xs text-muted-foreground">Prepare for interview</span>
              </Button>

              <Button className="h-auto py-6 flex-col items-start" variant="outline">
                <TrendingUp className="h-5 w-5 mb-2" />
                <span className="font-semibold">View Analytics</span>
                <span className="text-xs text-muted-foreground">Track your progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}