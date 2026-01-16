'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsStore } from '@/lib/store/stores';
import { Loader2, TrendingUp, TrendingDown, Users, Target, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { overview, insights, topCompanies, isLoading, error, fetchOverview, fetchInsights, fetchTopCompanies } =
    useAnalyticsStore();

  useEffect(() => {
    fetchOverview();
    fetchInsights();
    fetchTopCompanies();
  }, [fetchOverview, fetchInsights, fetchTopCompanies]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your job search performance</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {isLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              )}
              {!isLoading && error && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics unavailable</CardTitle>
                    <CardDescription>{error}</CardDescription>
                  </CardHeader>
                </Card>
              )}
              {!isLoading && !error && overview && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.total_applications}</div>
                        <p className="text-xs text-muted-foreground">Tracked applications</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.response_rate}%</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          Based on responded applications
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.interview_rate}%</div>
                        <p className="text-xs text-muted-foreground">
                          Interviews per application
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.avg_response_time_days} days</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-green-600" />
                          Based on responded apps
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Status Breakdown</CardTitle>
                      <CardDescription>Current status of all your applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Interviews Scheduled</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{overview.applications_by_status.interview || 0}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium">In Progress</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {(overview.applications_by_status.applied || 0) + (overview.applications_by_status.screening || 0)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-medium">Rejected</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{overview.applications_by_status.rejected || 0}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Offers Received</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{overview.applications_by_status.offer || 0}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Companies Applied</CardTitle>
                      <CardDescription>Companies you've applied to most</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {topCompanies.length === 0 ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400">No applications yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {topCompanies.map((company) => (
                            <div key={company.company} className="flex items-center justify-between">
                              <span className="font-medium">{company.company}</span>
                              <span className="text-sm text-slate-600">{company.application_count} applications</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="applications">
              {overview?.applications_by_month?.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Application Trends</CardTitle>
                    <CardDescription>Applications per month</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {overview.applications_by_month.map((row) => (
                      <div key={row.month} className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{row.month}</span>
                        <span className="text-sm font-semibold">{row.count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No application trends yet</CardTitle>
                    <CardDescription>Analytics will appear after you add applications.</CardDescription>
                  </CardHeader>
                  <CardContent className="py-10 text-center text-sm text-slate-600 dark:text-slate-400">
                    Add a few applications to see trends over time.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>AI-powered insights to improve your success rate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No insights yet. Add more activity to unlock suggestions.
                    </p>
                  ) : (
                    insights.map((insight, index) => (
                      <div
                        key={`${insight.type}-${index}`}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                          {insight.type}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{insight.message}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
