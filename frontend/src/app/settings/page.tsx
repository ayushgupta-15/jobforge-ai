'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { userService } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Save, Bell, Lock, CreditCard, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [accountData, setAccountData] = useState({
    full_name: '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    weeklyDigest: true,
    jobAlerts: true,
    applicationUpdates: true,
  });
  const [jobPreferences, setJobPreferences] = useState({
    targetRoles: '',
    targetLocations: '',
    minSalary: '',
    maxSalary: '',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setAccountData({ full_name: user.full_name || '' });
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    let isMounted = true;
    const loadPreferences = async () => {
      try {
        const prefs = await userService.getPreferences();
        if (!isMounted) {
          return;
        }
        setNotifications({
          emailNotifications: !!prefs.email_notifications,
          weeklyDigest: !!prefs.weekly_digest,
          jobAlerts: !!prefs.job_alerts,
          applicationUpdates: !!prefs.application_updates,
        });
        setJobPreferences({
          targetRoles: prefs.target_roles || '',
          targetLocations: prefs.target_locations || '',
          minSalary: prefs.min_salary ? String(prefs.min_salary) : '',
          maxSalary: prefs.max_salary ? String(prefs.max_salary) : '',
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }
        toast({
          title: 'Preferences unavailable',
          description: 'Could not load your preferences. Try again later.',
          variant: 'destructive',
        });
      }
    };
    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, [toast, user]);

  const handleAccountSave = async () => {
    setIsSavingAccount(true);
    try {
      const updatedUser = await userService.updateProfile({
        full_name: accountData.full_name,
      });
      setUser(updatedUser);
      toast({
        title: 'Account updated',
        description: 'Your account details were saved.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update your account details.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePreferencesSave = async () => {
    setIsSavingPreferences(true);
    try {
      const payload = {
        email_notifications: notifications.emailNotifications,
        weekly_digest: notifications.weeklyDigest,
        job_alerts: notifications.jobAlerts,
        application_updates: notifications.applicationUpdates,
        target_roles: jobPreferences.targetRoles || null,
        target_locations: jobPreferences.targetLocations || null,
        min_salary: jobPreferences.minSalary ? Number(jobPreferences.minSalary) : null,
        max_salary: jobPreferences.maxSalary ? Number(jobPreferences.maxSalary) : null,
      };
      const prefs = await userService.updatePreferences(payload);
      setNotifications({
        emailNotifications: !!prefs.email_notifications,
        weeklyDigest: !!prefs.weekly_digest,
        jobAlerts: !!prefs.job_alerts,
        applicationUpdates: !!prefs.application_updates,
      });
      setJobPreferences({
        targetRoles: prefs.target_roles || '',
        targetLocations: prefs.target_locations || '',
        minSalary: prefs.min_salary ? String(prefs.min_salary) : '',
        maxSalary: prefs.max_salary ? String(prefs.max_salary) : '',
      });
      toast({
        title: 'Preferences saved',
        description: 'Your notification and job preferences are updated.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Unable to save preferences.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.current || !passwordData.next) {
      toast({
        title: 'Missing fields',
        description: 'Please fill out all password fields.',
        variant: 'destructive',
      });
      return;
    }
    if (passwordData.next !== passwordData.confirm) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must match.',
        variant: 'destructive',
      });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await userService.changePassword(passwordData.current, passwordData.next);
      setPasswordData({ current: '', next: '', confirm: '' });
      toast({
        title: 'Password updated',
        description: 'Your password has been changed.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update password.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Settings</h1>
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
                      <Input
                        id="name"
                        value={accountData.full_name}
                        onChange={(event) =>
                          setAccountData({ ...accountData, full_name: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={user?.email} disabled />
                    </div>
                  </div>
                  <Button onClick={handleAccountSave} disabled={isSavingAccount}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingAccount ? 'Saving...' : 'Save Changes'}
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
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
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
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyDigest: checked })
                      }
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
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, jobAlerts: checked })
                      }
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
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, applicationUpdates: checked })
                      }
                    />
                  </div>

                  <Button onClick={handlePreferencesSave} disabled={isSavingPreferences}>
                    <Bell className="mr-2 h-4 w-4" />
                    {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
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
                    <Input
                      id="roles"
                      placeholder="e.g., Software Engineer, Full Stack Developer"
                      value={jobPreferences.targetRoles}
                      onChange={(event) =>
                        setJobPreferences({ ...jobPreferences, targetRoles: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locations">Preferred Locations</Label>
                    <Input
                      id="locations"
                      placeholder="e.g., San Francisco, Remote"
                      value={jobPreferences.targetLocations}
                      onChange={(event) =>
                        setJobPreferences({ ...jobPreferences, targetLocations: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-salary">Minimum Salary</Label>
                      <Input
                        id="min-salary"
                        type="number"
                        placeholder="e.g., 100000"
                        value={jobPreferences.minSalary}
                        onChange={(event) =>
                          setJobPreferences({ ...jobPreferences, minSalary: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-salary">Maximum Salary</Label>
                      <Input
                        id="max-salary"
                        type="number"
                        placeholder="e.g., 200000"
                        value={jobPreferences.maxSalary}
                        onChange={(event) =>
                          setJobPreferences({ ...jobPreferences, maxSalary: event.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handlePreferencesSave} disabled={isSavingPreferences}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
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
                    <Input
                      id="current"
                      type="password"
                      value={passwordData.current}
                      onChange={(event) =>
                        setPasswordData({ ...passwordData, current: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={passwordData.next}
                      onChange={(event) =>
                        setPasswordData({ ...passwordData, next: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={passwordData.confirm}
                      onChange={(event) =>
                        setPasswordData({ ...passwordData, confirm: event.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handlePasswordUpdate} disabled={isUpdatingPassword}>
                    <Lock className="mr-2 h-4 w-4" />
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
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
