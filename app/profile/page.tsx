'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/local-storage';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Camera,
  Save,
  Award,
  TrendingUp,
  Sprout,
  Calendar,
  Target,
  Settings,
  Bell,
  Shield,
  Key,
  HelpCircle,
  Smartphone,
  Globe,
  Clock,
  Activity
} from 'lucide-react';

// Remove dummy data - using real Supabase data now

export default function ProfilePage() {
  const { user: authUser, supabaseUser, profile, refreshProfile } = useAuth();
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Set user data from profile context
  const user = profile;

  // Track navigation to profile page
  useEffect(() => {
    if (authUser?.id) {
      localStorageService.recordNavigation(authUser.id, 'profile');
    }
  }, [authUser]);

  // Initialize edit form when editing starts
  useEffect(() => {
    if (isEditing && profile) {
      setEditedUser({
        name: profile.name || '',
        location: profile.location || '',
        phone: profile.phone || '',
        farm_name: profile.farm_name || '',
        farm_size: profile.farm_size || '',
        experience_years: profile.experience_years || '',
        bio: profile.bio || '',
        specialization: profile.specialization || '',
        preferences: profile.preferences || {
          notifications: {},
          privacy: {}
        }
      });
    }
  }, [isEditing, profile]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editedUser) {
      console.error('No edited user data available');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedUser.name,
          location: editedUser.location,
          phone: editedUser.phone,
          farm_name: editedUser.farm_name,
          farm_size: editedUser.farm_size,
          experience_years: editedUser.experience_years,
          specialization: editedUser.specialization,
          bio: editedUser.bio,
          avatar_url: editedUser.avatar_url,
          preferences: editedUser.preferences
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        
        // Save to local storage
        if (authUser?.id) {
          localStorageService.saveProfile(authUser.id, updatedProfile.profile);
          localStorageService.recordActivity(authUser.id, {
            type: 'profile_update',
            data: {
              action: 'updated profile information',
              fields: Object.keys(editedUser)
            }
          });
        }
        
        // Refresh profile data from AuthContext
        await refreshProfile();
        setIsEditing(false);
        setAlertMessage({type: 'success', message: 'Profile updated successfully!'});
        setTimeout(() => setAlertMessage(null), 5000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlertMessage({type: 'error', message: 'Failed to update profile. Please try again.'});
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user);
  };

  const handlePreferenceChange = (category: string, key: string, value: any) => {
    if (!editedUser) return;
    
    if (category === 'notifications') {
      setEditedUser({
        ...editedUser,
        preferences: {
          ...editedUser.preferences,
          notifications: {
            ...editedUser.preferences?.notifications,
            [key]: value
          }
        }
      });
    } else if (category === 'privacy') {
      setEditedUser({
        ...editedUser,
        preferences: {
          ...editedUser.preferences,
          privacy: {
            ...editedUser.preferences?.privacy,
            [key]: value
          }
        }
      });
    } else {
      setEditedUser({
        ...editedUser,
        preferences: {
          ...editedUser.preferences,
          [key]: value
        }
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExperienceLevel = (years: number) => {
    if (years < 2) return { level: 'Beginner', color: 'bg-green-100 text-green-800' };
    if (years < 5) return { level: 'Intermediate', color: 'bg-blue-100 text-blue-800' };
    if (years < 10) return { level: 'Advanced', color: 'bg-purple-100 text-purple-800' };
    return { level: 'Expert', color: 'bg-orange-100 text-orange-800' };
  };

  const experienceLevel = user?.experience_years ? getExperienceLevel(user.experience_years) : { level: 'Not specified', color: 'bg-gray-100 text-gray-800' };

  // Loading state - using profile context
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load profile data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Alert Messages */}
        {alertMessage && (
          <Alert className={`${alertMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
            {!isEditing && (
              <Button onClick={handleEditProfile} className="bg-green-600 hover:bg-green-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Personal Details</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                      <AvatarFallback className="text-2xl bg-green-100 text-green-800">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                        variant="outline"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <Badge className={experienceLevel.color}>
                          {experienceLevel.level} Farmer
                        </Badge>
                      </div>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Sprout className="w-4 h-4" />
                          <span>{user.farm_name || 'Farm name not set'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{user.location || 'Location not set'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(user.created_at || user.stats?.joinDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Farm Efficiency</p>
                      <p className="text-2xl font-bold text-green-600">{user.stats?.farmEfficiency || 85}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{user.stats?.totalCrops || 0}</p>
                      <p className="text-sm text-gray-600">Total Crops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{user.stats?.activeCrops || 0}</p>
                      <p className="text-sm text-gray-600">Active Crops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{user.stats?.communityPosts || 0}</p>
                      <p className="text-sm text-gray-600">Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{user.farm_size || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Hectares</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Specialization</Label>
                    <p className="mt-1">{user.specialization}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Experience</Label>
                    <p className="mt-1">{user.experience} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERSONAL DETAILS TAB */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <div className="flex items-center space-x-2">
                  {isEditing && (
                    <div className="space-x-2">
                      <Button onClick={handleSaveProfile} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" disabled={loading}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedUser?.name || ''}
                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.name || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={editedUser?.location || ''}
                        onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.location || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <p className="py-2 px-3 bg-gray-100 rounded-md text-gray-600">{supabaseUser?.email || 'Not available'}</p>
                    <p className="text-xs text-gray-500">Email cannot be changed here</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedUser?.phone || ''}
                        onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.phone || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    {isEditing ? (
                      <Input
                        id="farmName"
                        value={editedUser?.farm_name || ''}
                        onChange={(e) => setEditedUser({...editedUser, farm_name: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.farm_name || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                    {isEditing ? (
                      <Input
                        id="farmSize"
                        type="number"
                        step="0.1"
                        value={editedUser?.farm_size || ''}
                        onChange={(e) => setEditedUser({...editedUser, farm_size: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.farm_size ? `${user.farm_size} hectares` : 'Not set'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years)</Label>
                    {isEditing ? (
                      <Input
                        id="experience"
                        type="number"
                        value={editedUser?.experience_years || ''}
                        onChange={(e) => setEditedUser({...editedUser, experience_years: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.experience_years ? `${user.experience_years} years` : 'Not set'}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  {isEditing ? (
                    <Select 
                      value={editedUser?.specialization || ''} 
                      onValueChange={(value) => setEditedUser({...editedUser, specialization: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mixed Farming">Mixed Farming</SelectItem>
                        <SelectItem value="Crop Farming">Crop Farming</SelectItem>
                        <SelectItem value="Livestock">Livestock</SelectItem>
                        <SelectItem value="Dairy Farming">Dairy Farming</SelectItem>
                        <SelectItem value="Organic Farming">Organic Farming</SelectItem>
                        <SelectItem value="Greenhouse">Greenhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="py-2 px-3 bg-gray-50 rounded-md">{user.specialization}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      rows={4}
                      value={editedUser?.bio || ''}
                      onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                      placeholder="Tell us about yourself and your farming journey..."
                    />
                  ) : (
                    <p className="py-2 px-3 bg-gray-50 rounded-md min-h-[100px]">{user.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACHIEVEMENTS TAB */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>Achievements & Milestones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.achievements && user.achievements.length > 0 ? (
                    user.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Earned on {formatDate(achievement.date)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No achievements yet. Keep farming to earn your first achievement!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <ProfileSettings 
              preferences={editedUser?.preferences || {}} 
              onPreferenceChange={handlePreferenceChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
