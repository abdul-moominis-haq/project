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

// Dummy user data
const dummyUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Kamau',
  email: 'john.kamau@email.com',
  phone: '+254 712 345 678',
  avatar: '/api/placeholder/120/120',
  location: 'Nakuru, Kenya',
  farmName: 'Kamau Family Farm',
  farmSize: '15.5',
  experience: '8',
  specialization: 'Mixed Farming',
  bio: 'Passionate farmer dedicated to sustainable agriculture and innovative farming techniques. I focus on maize, beans, and dairy farming with modern IoT integration.',
  joinDate: '2020-03-15',
  achievements: [
    { title: 'Best Harvest 2024', description: 'Achieved highest yield in the region', date: '2024-07-15' },
    { title: 'Sustainable Farmer', description: 'Implemented eco-friendly practices', date: '2024-05-20' },
    { title: 'Tech Innovator', description: 'Early adopter of IoT sensors', date: '2023-11-10' }
  ],
  stats: {
    totalCrops: 12,
    activeSensors: 8,
    harvestsCompleted: 24,
    farmEfficiency: 92
  },
  preferences: {
    notifications: {
      email: true,
      sms: true,
      push: true,
      weather: true,
      harvest: true,
      maintenance: false
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: true,
      analytics: true
    },
    language: 'en',
    timezone: 'Africa/Nairobi',
    units: 'metric'
  }
};

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  
  // Create extended user profile based on auth user
  const createExtendedProfile = (authUser: any) => {
    if (!authUser) return dummyUser;
    
    const [firstName, ...lastNameParts] = authUser.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'Farmer';
    
    return {
      id: authUser.id,
      firstName: firstName,
      lastName: lastName,
      email: authUser.email,
      phone: '+254 712 345 678',
      avatar: '/api/placeholder/120/120',
      location: authUser.location,
      farmName: `${firstName}'s Farm`,
      farmSize: '15.5',
      experience: '8',
      specialization: 'Mixed Farming',
      bio: `Passionate farmer from ${authUser.location} dedicated to sustainable agriculture and innovative farming techniques. I focus on maize, beans, and dairy farming with modern IoT integration.`,
      joinDate: '2020-03-15',
      achievements: [
        { title: 'Best Harvest 2024', description: 'Achieved highest yield in the region', date: '2024-07-15' },
        { title: 'Sustainable Farmer', description: 'Implemented eco-friendly practices', date: '2024-05-20' },
        { title: 'Tech Innovator', description: 'Early adopter of IoT sensors', date: '2023-11-10' }
      ],
      stats: {
        totalCrops: 12,
        activeSensors: 8,
        harvestsCompleted: 24,
        farmEfficiency: 92
      },
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
          weather: true,
          harvest: true,
          maintenance: false
        },
        privacy: {
          profileVisibility: 'public',
          dataSharing: true,
          analytics: true
        },
        language: 'en',
        timezone: 'Africa/Nairobi',
        units: 'metric'
      }
    };
  };

  const [user, setUser] = useState(createExtendedProfile(authUser));
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Update user profile when auth user changes
  useEffect(() => {
    if (authUser) {
      const extendedProfile = createExtendedProfile(authUser);
      setUser(extendedProfile);
      setEditedUser(extendedProfile);
    }
  }, [authUser]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditedUser(user);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      // API call would go here
      // await userAPI.updateProfile(editedUser);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(editedUser);
      setIsEditing(false);
      setAlertMessage({type: 'success', message: 'Profile updated successfully!'});
      setTimeout(() => setAlertMessage(null), 5000);
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
    if (category === 'notifications') {
      setEditedUser({
        ...editedUser,
        preferences: {
          ...editedUser.preferences,
          notifications: {
            ...editedUser.preferences.notifications,
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
            ...editedUser.preferences.privacy,
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  const experienceLevel = getExperienceLevel(parseInt(user.experience));

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
                      <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="text-2xl bg-green-100 text-green-800">
                        {getInitials(user.firstName, user.lastName)}
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
                        <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                        <Badge className={experienceLevel.color}>
                          {experienceLevel.level} Farmer
                        </Badge>
                      </div>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Sprout className="w-4 h-4" />
                          <span>{user.farmName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Farming since {formatDate(user.joinDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Farm Efficiency</p>
                      <p className="text-2xl font-bold text-green-600">{user.stats.farmEfficiency}%</p>
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
                      <p className="text-2xl font-bold">{user.stats.totalCrops}</p>
                      <p className="text-sm text-gray-600">Active Crops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{user.stats.activeSensors}</p>
                      <p className="text-sm text-gray-600">IoT Sensors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{user.stats.harvestsCompleted}</p>
                      <p className="text-sm text-gray-600">Harvests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{user.farmSize}</p>
                      <p className="text-sm text-gray-600">Acres</p>
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
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedUser.firstName}
                        onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedUser.lastName}
                        onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.lastName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedUser.phone}
                        onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={editedUser.location}
                        onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.location}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    {isEditing ? (
                      <Input
                        id="farmName"
                        value={editedUser.farmName}
                        onChange={(e) => setEditedUser({...editedUser, farmName: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.farmName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (acres)</Label>
                    {isEditing ? (
                      <Input
                        id="farmSize"
                        type="number"
                        step="0.1"
                        value={editedUser.farmSize}
                        onChange={(e) => setEditedUser({...editedUser, farmSize: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.farmSize} acres</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years)</Label>
                    {isEditing ? (
                      <Input
                        id="experience"
                        type="number"
                        value={editedUser.experience}
                        onChange={(e) => setEditedUser({...editedUser, experience: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 px-3 bg-gray-50 rounded-md">{user.experience} years</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  {isEditing ? (
                    <Select 
                      value={editedUser.specialization} 
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
                      value={editedUser.bio}
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
                  {user.achievements.map((achievement, index) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <ProfileSettings 
              preferences={editedUser.preferences} 
              onPreferenceChange={handlePreferenceChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
