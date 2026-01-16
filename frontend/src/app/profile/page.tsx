'use client';

import { useRef, useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { userService } from '@/lib/api/services';
import { resolveAssetUrl } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });
  const completionFields = [
    profileData.full_name,
    profileData.phone,
    profileData.location,
    profileData.linkedin_url,
    profileData.github_url,
    profileData.portfolio_url,
  ];
  const completionTotal = completionFields.length;
  const completionFilled = completionFields.filter((field) => field && field.trim()).length;
  const completionPercent =
    completionTotal > 0 ? Math.round((completionFilled / completionTotal) * 100) : 0;

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
      const updatedUser = await userService.updateProfile({
        full_name: profileData.full_name,
        phone: profileData.phone || null,
        location: profileData.location || null,
        linkedin_url: profileData.linkedin_url || null,
        github_url: profileData.github_url || null,
        portfolio_url: profileData.portfolio_url || null,
      });
      setUser(updatedUser);

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

  const handleProfilePictureClick = () => {
    if (isUploadingPhoto) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const result = await userService.uploadProfilePicture(file);
      setUser({ ...user, profile_picture_url: result.url });
      toast({
        title: 'Photo updated',
        description: 'Your profile picture has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Unable to update profile picture.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your personal information and professional links
            </p>
          </div>

          {/* Profile Overview */}
          <Card className="mb-6 overflow-hidden border-slate-200/80 dark:border-slate-700">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 opacity-90" />
              <div className="relative p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/15 flex items-center justify-center text-2xl font-semibold">
                        {user?.profile_picture_url ? (
                          <img
                            src={resolveAssetUrl(user.profile_picture_url)}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user?.full_name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <button
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-blue-700 hover:text-blue-800 rounded-full flex items-center justify-center shadow-lg transition-colors"
                        onClick={handleProfilePictureClick}
                        type="button"
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{user?.full_name}</h3>
                      <p className="text-sm text-blue-100">{user?.email}</p>
                      <p className="text-xs text-blue-100/80 mt-1">
                        Member since{' '}
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-white/10 px-4 py-2">
                      <p className="text-xs uppercase tracking-wide text-blue-100/70">Profile completeness</p>
                      <p className="text-lg font-semibold">{completionPercent}%</p>
                      <p className="text-xs text-blue-100/70">{completionFilled}/{completionTotal} fields</p>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} className="bg-white text-blue-700 hover:bg-blue-50">
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {user?.subscription_tier?.toUpperCase() || 'FREE'}
                </div>
                <div className="text-xs text-slate-500 mt-1">Subscription</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {user?.email_verified ? 'Verified' : 'Unverified'}
                </div>
                <div className="text-xs text-slate-500 mt-1">Email Status</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {user?.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-slate-500 mt-1">Account</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {user?.last_login_at
                    ? new Date(user.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </div>
                <div className="text-xs text-slate-500 mt-1">Last Login</div>
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
              {isEditing && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Editing</p>
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
