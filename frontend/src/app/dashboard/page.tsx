'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Briefcase, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';
import { useResumeStore, useApplicationStore, useInterviewStore } from '@/lib/store/stores';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const { resumes, fetchResumes } = useResumeStore();
  const { stats, fetchApplications } = useApplicationStore();
  const { upcomingInterviews, fetchUpcomingInterviews } = useInterviewStore();

  useEffect(() => {
    fetchResumes();
    fetchApplications();
    fetchUpcomingInterviews();
  }, [fetchResumes, fetchApplications, fetchUpcomingInterviews]);

  const applicationTrendData = [
    { month: 'Jan', applications: 4, interviews: 2, offers: 0 },
    { month: 'Feb', applications: 6, interviews: 3, offers: 1 },
    { month: 'Mar', applications: 8, interviews: 4, offers: 1 },
    { month: 'Apr', applications: 12, interviews: 5, offers: 2 },
    { month: 'May', applications: 15, interviews: 6, offers: 2 },
    { month: 'Jun', applications: 18, interviews: 8, offers: 3 },
  ];

  const statusDistribution = [
    { name: 'Applied', value: stats?.by_status?.applied || 12, color: '#3b82f6' },
    { name: 'Screening', value: stats?.by_status?.screening || 8, color: '#f59e0b' },
    { name: 'Interview', value: stats?.by_status?.interview || 5, color: '#8b5cf6' },
    { name: 'Offer', value: stats?.by_status?.offer || 2, color: '#10b981' },
    { name: 'Rejected', value: stats?.by_status?.rejected || 6, color: '#ef4444' },
  ];

  const responseTimeData = [
    { day: 'Mon', time: 7 },
    { day: 'Tue', time: 5 },
    { day: 'Wed', time: 8 },
    { day: 'Thu', time: 4 },
    { day: 'Fri', time: 6 },
    { day: 'Sat', time: 9 },
    { day: 'Sun', time: 10 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg border-white/20">
          <p className="text-sm font-semibold">{payload[0].payload.month || payload[0].payload.day}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>

        <div className="relative p-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in-down">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse-glow" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Here's your job search overview and insights
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card border-white/20 hover-lift group animate-fade-in-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {resumes.length}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                  {resumes.filter(r => r.is_primary).length} primary
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover-lift group animate-fade-in-up animation-delay-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats?.total || 0}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                  {(stats?.by_status?.applied || 0) + (stats?.by_status?.screening || 0)} active
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover-lift group animate-fade-in-up animation-delay-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {upcomingInterviews.length}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">upcoming</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover-lift group animate-fade-in-up animation-delay-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats?.total ? Math.round((stats.by_status?.offer || 0) / stats.total * 100) : 0}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                  {stats?.by_status?.offer || 0} offers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Application Trend Chart */}
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Application Trends
                </CardTitle>
                <CardDescription>Your application activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={applicationTrendData}>
                    <defs>
                      <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorApplications)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interviews" 
                      stroke="#8b5cf6" 
                      fillOpacity={1} 
                      fill="url(#colorInterviews)" 
                      strokeWidth={2}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution Pie Chart */}
            <Card className="glass-card border-white/20 animate-fade-in-up animation-delay-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Status Distribution
                </CardTitle>
                <CardDescription>Current state of your applications</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Response Time Chart */}
          <Card className="glass-card border-white/20 mb-8 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Average Response Time
              </CardTitle>
              <CardDescription>How long companies take to respond (in days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="time" 
                    fill="url(#colorBar)"
                    radius={[8, 8, 0, 0]}
                  >
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card border-white/20 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>Get started with JobForge AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="h-auto py-6 flex-col items-start bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover-lift">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Upload Resume</span>
                  <span className="text-xs opacity-90">Get AI analysis</span>
                </Button>

                <Button className="h-auto py-6 flex-col items-start bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover-lift">
                  <Briefcase className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Track Application</span>
                  <span className="text-xs opacity-90">Add new job</span>
                </Button>

                <Button className="h-auto py-6 flex-col items-start bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover-lift">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Schedule Interview</span>
                  <span className="text-xs opacity-90">Prepare now</span>
                </Button>

                <Button className="h-auto py-6 flex-col items-start bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover-lift">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="font-semibold">View Analytics</span>
                  <span className="text-xs opacity-90">Track progress</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
