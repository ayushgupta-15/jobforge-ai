'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import AddApplicationModal from '@/components/modals/AddApplicationModal';
import { useApplicationStore } from '@/lib/store/stores';

export default function ApplicationsPage() {
  const { applications, stats, isLoading, fetchApplications } = useApplicationStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (isLoading && applications.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      applied: <Clock className="h-4 w-4 text-blue-600" />,
      interview: <Briefcase className="h-4 w-4 text-purple-600" />,
      offer: <CheckCircle className="h-4 w-4 text-green-600" />,
      rejected: <XCircle className="h-4 w-4 text-red-600" />,
      draft: <Clock className="h-4 w-4 text-slate-400" />,
      screening: <Clock className="h-4 w-4 text-yellow-600" />,
      accepted: <CheckCircle className="h-4 w-4 text-green-700" />,
    };
    return icons[status as keyof typeof icons] || <Briefcase className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-700',
      interview: 'bg-purple-100 text-purple-700',
      offer: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      draft: 'bg-slate-100 text-slate-700',
      screening: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-200 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Applications</h1>
              <p className="text-slate-600">Track your job applications</p>
            </div>
            <AddApplicationModal onSuccess={fetchApplications} />
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.by_status?.applied || 0) + (stats.by_status?.screening || 0) + (stats.by_status?.interview || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.by_status?.offer || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Briefcase className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-slate-600 mb-4">Start by adding your first application</p>
                <AddApplicationModal onSuccess={fetchApplications} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-lg">{app.job_title}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(app.status)}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                        <CardDescription>{app.company_name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {app.source && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Source:</span> {app.source}
                        </div>
                      )}
                      {app.applied_date && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Applied:</span> {new Date(app.applied_date).toLocaleDateString()}
                        </div>
                      )}
                      {app.match_score !== null && app.match_score !== undefined && (
                        <div className="text-sm text-slate-600">
                          <span className="font-semibold">Match Score:</span> {Math.round(app.match_score)}%
                        </div>
                      )}
                      {app.notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                          <p className="text-slate-600">{app.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Schedule Interview
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Delete
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
