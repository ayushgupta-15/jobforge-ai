'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { useInterviewStore } from '@/lib/store/stores';

export default function InterviewsPage() {
  const { interviews, isLoading, fetchInterviews } = useInterviewStore();

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  if (isLoading && interviews.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  const getInterviewTypeColor = (type: string) => {
    const colors = {
      phone: 'bg-blue-100 text-blue-700',
      video: 'bg-purple-100 text-purple-700',
      in_person: 'bg-green-100 text-green-700',
      panel: 'bg-orange-100 text-orange-700',
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Interviews</h1>
            <p className="text-slate-600">Manage and track your interviews</p>
          </div>

          {interviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No interviews scheduled</h3>
                <p className="text-slate-600 mb-4">Your scheduled interviews will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">Interview</CardTitle>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getInterviewTypeColor(interview.interview_type)}`}>
                            {interview.interview_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(interview.status)}`}>
                            {interview.status}
                          </span>
                        </div>
                        {interview.interviewer_name && (
                          <CardDescription>With {interview.interviewer_name}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(interview.scheduled_at).toLocaleDateString()}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      {interview.duration_minutes && (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>{interview.duration_minutes} minutes</span>
                        </div>
                      )}

                      {interview.location_or_url && (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span>{interview.location_or_url}</span>
                        </div>
                      )}

                      {interview.notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                          <p className="font-semibold mb-1">Notes</p>
                          <p className="text-slate-600">{interview.notes}</p>
                        </div>
                      )}

                      {interview.feedback && (
                        <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                          <p className="font-semibold mb-1 text-green-900">Feedback</p>
                          <p className="text-green-800">{interview.feedback}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm">
                          Edit
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
