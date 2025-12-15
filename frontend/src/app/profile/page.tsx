'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe,
  Camera,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
        linkedin_url: (user as any).linkedin_url || '',
        github_url: (user as any).github_url || '',
        portfolio_url: (user as any).portfolio_url || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original user data
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
        linkedin_url: (user as any).linkedin_url || '',
        github_url: (user as any).github_url || '',
        portfolio_url: (user as any).portfolio_url || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your personal information and professional links
            </p>
          </div>

          {/* Profile Picture Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    {user?.full_name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic profile details</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    placeholder="john@example.com"
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Links */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
              <CardDescription>Connect your professional profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">
                  <Linkedin className="inline h-4 w-4 mr-2" />
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  type="url"
                  value={profileData.linkedin_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">
                  <Github className="inline h-4 w-4 mr-2" />
                  GitHub Profile
                </Label>
                <Input
                  id="github_url"
                  name="github_url"
                  type="url"
                  value={profileData.github_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://github.com/johndoe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">
                  <Globe className="inline h-4 w-4 mr-2" />
                  Portfolio Website
                </Label>
                <Input
                  id="portfolio_url"
                  name="portfolio_url"
                  type="url"
                  value={profileData.portfolio_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://johndoe.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>Your JobForge AI activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user?.subscription_tier?.toUpperCase() || 'FREE'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Subscription
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {user?.email_verified ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Email Verified
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Status
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {user?.last_login_at 
                      ? new Date(user.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'N/A'
                    }
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Last Login
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons (when editing) */}
          {isEditing && (
            <div className="mt-6 flex gap-4 justify-end">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}