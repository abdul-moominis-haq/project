'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WeatherCharts } from '@/components/weather/WeatherCharts';
import { fetchWeatherData, WeatherData } from '@/services/weather-data';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/local-storage';
import ghanaWeatherService, { GhanaWeatherData } from '@/services/ghana-weather';
import ghanaLocationService from '@/services/ghana-location';

const WeatherPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [activeTab, setActiveTab] = useState('current');

  // Fetch weather data on component mount
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherData(30); // Fetch last 30 days of data
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {/* Existing current weather content */}
          </TabsContent>

          <TabsContent value="historical">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Weather Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && <p>Loading weather data...</p>}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {!loading && !error && weatherData.length > 0 && (
                    <WeatherCharts data={weatherData} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default WeatherPage;
