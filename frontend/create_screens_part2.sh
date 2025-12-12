#!/bin/bash
# Create Applications and Jobs pages

cd ~/jobforge-ai/frontend

echo "📝 Creating Applications page..."

cat > src/app/applications/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const applications = [
    {
      id: '1',
      company: 'Google',
      position: 'Senior Software Engineer',
      status: 'interview',
      appliedDate: '2024-01-15',
      salary: '$150k - $200k',
      location: 'Mountain View, CA',
    },
    {
      id: '2',
      company: 'Microsoft',
      position: 'Full Stack Developer',
      status: 'applied',
      appliedDate: '2024-01-12',
      salary: '$140k - $180k',
      location: 'Seattle, WA',
    },
    {
      id: '3',
      company: 'Meta',
      position: 'Frontend Engineer',
      status: 'rejected',
      appliedDate: '2024-01-08',
      salary: '$160k - $210k',
      location: 'Menlo Park, CA',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'interview':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'applied':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'offer':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      applied: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      interview: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      offer: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filterByStatus = (status: string) => {
    if (status === 'all') return applications;
    return applications.filter(app => app.status === status);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Applications</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Track and manage your job applications
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search companies or positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Applied</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>In Progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">5</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">3</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">1</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="applied">Applied (1)</TabsTrigger>
              <TabsTrigger value="interview">Interview (1)</TabsTrigger>
              <TabsTrigger value="offer">Offers (0)</TabsTrigger>
              <TabsTrigger value="rejected">Rejected (1)</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{app.position}</CardTitle>
                          <CardDescription className="text-base">{app.company}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Applied {new Date(app.appliedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {app.salary}
                      </div>
                      <div className="flex items-center gap-2">
                        {app.location}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Update Status</Button>
                      <Button variant="outline" size="sm">Add Note</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
EOF

echo "✅ Applications page created"

# ============================================
# Jobs Page
# ============================================

echo "🔍 Creating Jobs page..."

cat > src/app/jobs/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Bookmark,
  ExternalLink,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock job data
  const jobs = [
    {
      id: '1',
      title: 'Senior Full Stack Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$180k - $250k',
      posted: '2 days ago',
      remote: true,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      matchScore: 92,
    },
    {
      id: '2',
      title: 'Frontend Engineer',
      company: 'Airbnb',
      location: 'Remote',
      type: 'Full-time',
      salary: '$160k - $220k',
      posted: '1 week ago',
      remote: true,
      skills: ['React', 'Next.js', 'TypeScript', 'GraphQL'],
      matchScore: 88,
    },
    {
      id: '3',
      title: 'Backend Engineer',
      company: 'Uber',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$170k - $230k',
      posted: '3 days ago',
      remote: false,
      skills: ['Python', 'Go', 'PostgreSQL', 'Kubernetes'],
      matchScore: 85,
    },
  ];

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
              AI-powered job matching based on your profile and skills
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mb-8">
            <Button variant="outline" size="sm">All Jobs</Button>
            <Button variant="outline" size="sm">Remote Only</Button>
            <Button variant="outline" size="sm">Full-time</Button>
            <Button variant="outline" size="sm">Contract</Button>
            <Button variant="outline" size="sm">Senior Level</Button>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-slate-600 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{jobs.length}</span> jobs matching your profile
            </p>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.remote && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            Remote
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">{job.company}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Match Score</div>
                        <div className="text-2xl font-bold text-green-600">{job.matchScore}%</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {job.posted}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      Apply Now
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      AI Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
EOF

echo "✅ Jobs page created"

# ============================================
# Interviews Page
# ============================================

echo "📅 Creating Interviews page..."

cat > src/app/interviews/page.tsx << 'EOF'
'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  CheckCircle2
} from 'lucide-react';

export default function InterviewsPage() {
  const interviews = [
    {
      id: '1',
      company: 'Google',
      position: 'Senior Software Engineer',
      type: 'Technical Interview',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: '60 min',
      format: 'Video Call',
      status: 'upcoming',
    },
    {
      id: '2',
      company: 'Microsoft',
      position: 'Full Stack Developer',
      type: 'Phone Screen',
      date: '2024-01-18',
      time: '10:00 AM',
      duration: '30 min',
      format: 'Phone',
      status: 'completed',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interviews</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Prepare and manage your upcoming interviews
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>

          <div className="space-y-4">
            {interviews.map((interview) => (
              <Card key={interview.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{interview.type}</CardTitle>
                        <Badge variant={interview.status === 'upcoming' ? 'default' : 'secondary'}>
                          {interview.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {interview.position} at {interview.company}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-600" />
                      {new Date(interview.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-600" />
                      {interview.time} ({interview.duration})
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-slate-600" />
                      {interview.format}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button>Prepare with AI</Button>
                    <Button variant="outline">View Details</Button>
                    {interview.status === 'upcoming' && (
                      <Button variant="outline">Reschedule</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
EOF

echo "✅ Interviews page created"

echo ""
echo "✅ All pages created!"
echo "Run: npm run dev"
