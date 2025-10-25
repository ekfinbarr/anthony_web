/**
 * User Profile Settings Page
 * Comprehensive user profile management with personal information,
 * spiritual preferences, privacy settings, and account management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  Save,
  Upload,
  Edit3,
  Camera,
  Heart,
  Star,
  Users,
  Church,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

// Hooks and Utils
import { usePersonalization } from '@/hooks/dashboard/usePersonalization';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { uiUtils } from '@/lib/dashboard-utils';

/**
 * Interface for user profile form data
 */
interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  zipCode: string;
  bio: string;
  interests: string[];
  ministries: string[];
}

/**
 * Interface for privacy settings
 */
interface PrivacySettings {
  showProfile: boolean;
  showActivity: boolean;
  shareProgress: boolean;
  allowRecommendations: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * Animation variants for page sections
 */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

/**
 * Profile Settings Page Component
 */
export default function ProfileSettings() {
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form data state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    address: '123 Church Street',
    city: 'Lagos',
    zipCode: '12345',
    bio: 'Passionate about faith and community service. Love connecting with others through spiritual growth.',
    interests: ['prayer', 'bible study', 'community service', 'youth ministry'],
    ministries: ['youth', 'music', 'outreach']
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showProfile: true,
    showActivity: true,
    shareProgress: true,
    allowRecommendations: true,
    emailNotifications: true,
    pushNotifications: false
  });

  // Hooks
  const { user, updateUserPreferences } = useDashboardData();
  const { exportData, resetMetrics } = usePersonalization();

  /**
   * Available interests for selection
   */
  const availableInterests = [
    'prayer', 'bible study', 'worship', 'community service', 'evangelism',
    'youth ministry', 'children ministry', 'music', 'teaching', 'counseling',
    'missions', 'outreach', 'fellowship', 'discipleship', 'leadership'
  ];

  /**
   * Available ministries for selection
   */
  const availableMinistries = [
    'youth', 'children', 'music', 'worship', 'outreach', 'missions',
    'counseling', 'teaching', 'administration', 'hospitality', 'media',
    'prayer team', 'ushering', 'security', 'maintenance'
  ];

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle privacy setting changes
   */
  const handlePrivacyChange = (setting: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  /**
   * Handle interest toggle
   */
  const toggleInterest = (interest: string) => {
    const currentInterests = profileData.interests;
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    handleInputChange('interests', updatedInterests);
  };

  /**
   * Handle ministry toggle
   */
  const toggleMinistry = (ministry: string) => {
    const currentMinistries = profileData.ministries;
    const updatedMinistries = currentMinistries.includes(ministry)
      ? currentMinistries.filter(m => m !== ministry)
      : [...currentMinistries, ministry];
    
    handleInputChange('ministries', updatedMinistries);
  };

  /**
   * Save profile changes
   */
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user preferences with new data
      await updateUserPreferences({
        ...user?.preferences,
        privacySettings: {
          showActivityStatus: privacySettings.showActivity,
          shareGrowthProgress: privacySettings.shareProgress,
          allowRecommendations: privacySettings.allowRecommendations
        },
        notificationSettings: {
          ...user?.preferences?.notificationSettings,
          emailNotifications: privacySettings.emailNotifications,
          pushNotifications: privacySettings.pushNotifications
        }
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile settings have been saved successfully.',
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        // Handle avatar update
        toast({
          title: 'Avatar Updated',
          description: 'Your profile picture has been updated.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Export user data
   */
  const handleExportData = () => {
    const userData = {
      profile: profileData,
      privacy: privacySettings,
      personalization: exportData()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-church-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Data Exported',
      description: 'Your data has been downloaded successfully.',
    });
  };

  /**
   * Delete account (placeholder)
   */
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: 'Account Deletion',
        description: 'Please contact church administration to delete your account.',
        variant: 'destructive'
      });
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="interests" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Interests
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="/placeholder-avatar.jpg" alt={profileData.name} />
                          <AvatarFallback className="text-lg">
                            {uiUtils.getInitials(profileData.name)}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarUpload}
                            />
                          </label>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{profileData.name}</h3>
                        <p className="text-muted-foreground">{profileData.email}</p>
                        <Badge variant="secondary">
                          Member since {new Date().getFullYear() - 2}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Tell us about yourself and your spiritual journey..."
                      />
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Spiritual Interests</CardTitle>
                    <CardDescription>
                      Select your areas of interest to receive personalized content recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Your Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {availableInterests.map((interest) => (
                          <Badge
                            key={interest}
                            variant={profileData.interests.includes(interest) ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => toggleInterest(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Ministry Involvement</Label>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {availableMinistries.map((ministry) => (
                          <Badge
                            key={ministry}
                            variant={profileData.ministries.includes(ministry) ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => toggleMinistry(ministry)}
                          >
                            <Church className="h-3 w-3 mr-1" />
                            {ministry}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <Heart className="h-4 w-4" />
                      <AlertDescription>
                        Your selections help us provide personalized content and connect you with relevant ministries and groups.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Control your privacy and what information is shared
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Show Profile to Others</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow other members to see your profile information
                          </p>
                        </div>
                        <Switch
                          checked={privacySettings.showProfile}
                          onCheckedChange={(checked) => handlePrivacyChange('showProfile', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Show Activity Status</Label>
                          <p className="text-sm text-muted-foreground">
                            Let others see when you're active in the community
                          </p>
                        </div>
                        <Switch
                          checked={privacySettings.showActivity}
                          onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Share Spiritual Progress</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow your spiritual growth progress to be visible to others
                          </p>
                        </div>
                        <Switch
                          checked={privacySettings.shareProgress}
                          onCheckedChange={(checked) => handlePrivacyChange('shareProgress', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Personalized Recommendations</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable AI-powered content and activity recommendations
                          </p>
                        </div>
                        <Switch
                          checked={privacySettings.allowRecommendations}
                          onCheckedChange={(checked) => handlePrivacyChange('allowRecommendations', checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email updates about events and activities
                          </p>
                        </div>
                        <Switch
                          checked={privacySettings.emailNotifications}
                          onCheckedChange={(checked) => handlePrivacyChange('emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive browser notifications for important updates
                          </p>
                        </div>
                        <Switch
                          checked={privacySettings.pushNotifications}
                          onCheckedChange={(checked) => handlePrivacyChange('pushNotifications', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>
                      Manage your account data and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Export Your Data</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Download all your personal data, preferences, and spiritual progress information.
                        </p>
                        <Button variant="outline" onClick={handleExportData}>
                          <Upload className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Reset Personalization</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Clear all personalization data and start fresh with recommendations.
                        </p>
                        <Button variant="outline" onClick={resetMetrics}>
                          Reset Preferences
                        </Button>
                      </div>

                      <div className="p-4 border border-destructive rounded-lg">
                        <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}