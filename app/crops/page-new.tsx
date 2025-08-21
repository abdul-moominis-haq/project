'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/ui/search-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/local-storage';
import openWeatherService, { ProcessedWeatherData, WeatherRecommendation } from '@/services/openweather-api';
import { WeatherCharts } from '@/components/weather/WeatherCharts';
import { fetchWeatherData, WeatherData } from '@/services/weather-data';

const CropsPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fetch weather data on component mount
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setWeatherLoading(true);
        const data = await fetchWeatherData(7); // Fetch last 7 days of data for crops
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Crop Management</h1>
          <SearchBar 
            placeholder="Search crops..." 
            value={searchQuery}
            onChange={(value: string) => setSearchQuery(value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Crop List and Details */}
          <div className="space-y-6">
            {/* Your existing crop management content */}
          </div>

          {/* Right Column - Weather Data */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weather Impact on Crops</CardTitle>
              </CardHeader>
              <CardContent>
                {weatherLoading ? (
                  <p>Loading weather data...</p>
                ) : weatherData.length > 0 ? (
                  <WeatherCharts data={weatherData} />
                ) : (
                  <p>No weather data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CropsPage;
