#!/bin/bash
# JobForge AI - Complete Frontend Features
# This creates all remaining pages and features

set -e

cd "$(dirname "$0")"

echo "📁 Ensuring directory structure exists..."

mkdir -p src/app/{settings,analytics,profile,resumes,applications,jobs,interviews}
mkdir -p src/components/{layout,dashboard,resumes,applications,jobs}
mkdir -p src/lib/{api,store}
mkdir -p src/types

echo "✅ Directories ready!"
echo ""


echo "🎨 Creating Complete Frontend Features..."
echo "=========================================="
echo ""

# ============================================
# 1. Settings Page
# ============================================

echo "⚙️  Creating Settings page..."

cat > src/app/settings/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Save, Bell, Lock, CreditCard, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    weeklyDigest: true,
    jobAlerts: true,
    applicationUpdates: true,
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user?.full_name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={user?.email} disabled />
                    </div>
                  </div>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Manage your subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Current Plan: {user?.subscription_tier?.toUpperCase()}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {user?.subscription_tier === 'free' ? 'Upgrade to unlock premium features' : 'Active'}
                      </p>
                    </div>
                    <Button variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      {user?.subscription_tier === 'free' ? 'Upgrade' : 'Manage'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose what emails you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notif">Email Notifications</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Receive important updates via email</p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly">Weekly Digest</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Get a weekly summary of your activity</p>
                    </div>
                    <Switch
                      id="weekly"
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) => setNotifications({...notifications, weeklyDigest: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="job-alerts">Job Alerts</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Get notified about matching jobs</p>
                    </div>
                    <Switch
                      id="job-alerts"
                      checked={notifications.jobAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, jobAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-updates">Application Updates</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Updates on your job applications</p>
                    </div>
                    <Switch
                      id="app-updates"
                      checked={notifications.applicationUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, applicationUpdates: checked})}
                    />
                  </div>

                  <Button>
                    <Bell className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                  <CardDescription>Set your job search preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roles">Target Roles</Label>
                    <Input id="roles" placeholder="e.g., Software Engineer, Full Stack Developer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locations">Preferred Locations</Label>
                    <Input id="locations" placeholder="e.g., San Francisco, Remote" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-salary">Minimum Salary</Label>
                      <Input id="min-salary" type="number" placeholder="e.g., 100000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-salary">Maximum Salary</Label>
                      <Input id="max-salary" type="number" placeholder="e.g., 200000" />
                    </div>
                  </div>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password regularly for security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input id="current" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input id="new" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input id="confirm" type="password" />
                  </div>
                  <Button>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
EOF

echo "✅ Settings page created"

# ============================================
# 2. Analytics Page
# ============================================

echo "📊 Creating Analytics page..."

cat > src/app/analytics/page.tsx << 'EOF'
'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your job search performance</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42%</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      +5% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">28%</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      +8% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7 days</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-green-600" />
                      -2 days from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Application Status Breakdown */}
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
                        <div className="text-2xl font-bold">8</div>
                        <div className="text-sm text-slate-600">17%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">In Progress</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">23</div>
                        <div className="text-sm text-slate-600">49%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium">Rejected</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-slate-600">26%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Offers Received</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">4</div>
                        <div className="text-sm text-slate-600">8%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Companies Applied</CardTitle>
                  <CardDescription>Companies you've applied to most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company, i) => (
                      <div key={company} className="flex items-center justify-between">
                        <span className="font-medium">{company}</span>
                        <span className="text-sm text-slate-600">{5 - i} applications</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                  <CardDescription>Your application activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-slate-600 py-8">
                    Chart visualization would go here (integrate with recharts)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>AI-powered insights to improve your success rate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="font-semibold text-green-900 dark:text-green-300 mb-2">🎯 Strength</p>
                    <p className="text-sm text-green-800 dark:text-green-400">
                      Your response rate is 15% above average for your experience level
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Tip</p>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Applications sent on Tuesday-Thursday have 23% higher response rates
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚡ Opportunity</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      Consider applying to 3-4 more companies per week to increase your chances
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
EOF

echo "✅ Analytics page created"

# ============================================
# 3. Add missing shadcn components
# ============================================

echo "📦 Installing additional shadcn components..."

echo "✅ Features created!"
echo ""
echo "Next steps:"
echo "1. Install missing components: npx shadcn-ui@latest add switch"
echo "2. Restart server: npm run dev"
echo ""
