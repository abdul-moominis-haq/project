'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { CropCard } from '@/components/dashboard/CropCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SearchBar } from '@/components/ui/search-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/local-storage';
import { 
  Sprout, 
  Activity, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  currentWeather, 
  tomorrowForecast, 
  dummyAdvisories 
} from '@/lib/dummy-data';
import { Crop, Advisory } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  // Track navigation to dashboard
  useEffect(() => {
    if (user?.id) {
      localStorageService.recordNavigation(user.id, 'dashboard');
    }
  }, [user]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize empty state values
  const activeCrops = 0;
  const averageHealth = 0;
  const daysToNextHarvest = 0;

  const getPriorityColor = (priority: Advisory['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: Advisory['priority']) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  // Filter content based on search query
  // Initialize empty crops array
  const filteredCrops: Crop[] = [];

  const filteredAdvisories = dummyAdvisories.filter(advisory =>
    advisory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advisory.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Search */}
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Farm Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Monitor your crops, weather, and farm operations</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-md">
            <SearchBar 
              placeholder="Search crops, advisories, or farm data..."
              value={searchQuery}
              onChange={setSearchQuery}
              size="md"
            />
          </div>
        </div>

        {/* Stats Cards - Enhanced Responsiveness */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="Active Crops"
            value={activeCrops.toString()}
            icon={<Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            trend={{ value: 2, isUpward: true }}
          />
          <StatsCard
            title="Avg Health"
            value={`${averageHealth}%`}
            icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
            trend={{ value: 5, isUpward: true }}
          />
          <StatsCard
            title="Next Harvest"
            value={`${daysToNextHarvest} days`}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
            trend={{ value: 0, isUpward: true }}
          />
          <StatsCard
            title="Weekly Growth"
            value="12%"
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
            trend={{ value: 2, isUpward: true }}
          />
        </div>

        {/* Main Content - Enhanced Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Full width on mobile/tablet, 3 cols on large desktop */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Weather Card */}
            <WeatherCard current={currentWeather} forecast={tomorrowForecast} />

            {/* Crops Overview */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Crop Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
                  {filteredCrops.map((crop) => {
                    return (
                      <CropCard
                        key={crop.id}
                        crop={{
                          ...crop,
                          expectedharvest: crop.expectedharvest
                            ? new Date(crop.expectedharvest).toLocaleDateString()
                            : 'N/A',
                        }}
                        onViewDetails={() => setSelectedCrop(crop)} />
                    );
                  })}
                  {filteredCrops.length === 0 && searchQuery && (
                    <div className="col-span-full text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                      No crops found matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Full width on mobile/tablet */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Recent Advisories */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Farm Advisories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {filteredAdvisories.map((advisory) => (
                    <div key={advisory.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm sm:text-base text-gray-900 flex-1 mr-2">{advisory.title}</h4>
                        <Badge className={`${getPriorityColor(advisory.priority)} text-xs shrink-0`}>
                          <span className="flex items-center space-x-1">
                            {getPriorityIcon(advisory.priority)}
                            <span className="hidden sm:inline">{advisory.priority}</span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-3">{advisory.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate mr-2">{advisory.category}</span>
                        <span className="whitespace-nowrap">
                          {new Date(advisory.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredAdvisories.length === 0 && searchQuery && (
                    <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                      No advisories found matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Sprout className="w-4 h-4 mr-2" />
                    Add New Crop
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    Record Activity
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Crop Details Modal */}
        {selectedCrop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedCrop.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCrop(null)}>
                  ×
                </Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{selectedCrop.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Variety:</span>
                    <p className="font-medium">{selectedCrop.variety}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Health:</span>
                    <p className="font-medium">{selectedCrop.health}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Progress:</span>
                    <p className="font-medium">{selectedCrop.progress}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{selectedCrop.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Area:</span>
                    <p className="font-medium">{selectedCrop.area} hectares</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Stage:</span>
                  <p className="font-medium">{selectedCrop.stage}</p>
                </div>
                <div>
                  <span className="text-gray-500">Expected Harvest:</span>
                  <p className="font-medium">
                    {selectedCrop.expectedharvest ? new Date(selectedCrop.expectedharvest).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}