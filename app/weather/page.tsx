'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cloud, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind,
  Sun,
  BarChart3,
  TrendingUp,
  Cpu,
  Battery,
  Wifi,
  WifiOff,
  Settings,
  Sprout,
  Calendar,
  Activity
} from 'lucide-react';
import { historicalWeatherData, currentWeather, dummyIoTSensors, dummyCrops } from '@/lib/dummy-data';

export default function WeatherPage() {
  const [selectedLocation, setSelectedLocation] = useState('nairobi');
  const [selectedSensor, setSelectedSensor] = useState('');

  const locations = [
    { value: 'nairobi', label: 'Nairobi, Kenya', coords: '-1.2921°, 36.8219°' },
    { value: 'mombasa', label: 'Mombasa, Kenya', coords: '-4.0435°, 39.6682°' },
    { value: 'kisumu', label: 'Kisumu, Kenya', coords: '-0.0917°, 34.7680°' },
    { value: 'nakuru', label: 'Nakuru, Kenya', coords: '-0.3031°, 36.0800°' }
  ];

  const currentLocationData = locations.find(loc => loc.value === selectedLocation);

  const temperatureData = historicalWeatherData.map(data => ({
    date: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temperature: data.temperature
  }));

  const weeklyForecast = [
    { day: 'Mon', temp: 26, condition: '☀️', humidity: 65, rainfall: 0 },
    { day: 'Tue', temp: 24, condition: '⛅', humidity: 70, rainfall: 1.2 },
    { day: 'Wed', temp: 28, condition: '☀️', humidity: 58, rainfall: 0 },
    { day: 'Thu', temp: 25, condition: '🌧️', humidity: 80, rainfall: 8.5 },
    { day: 'Fri', temp: 23, condition: '⛅', humidity: 72, rainfall: 2.1 },
    { day: 'Sat', temp: 27, condition: '☀️', humidity: 62, rainfall: 0 },
    { day: 'Sun', temp: 29, condition: '☀️', humidity: 55, rainfall: 0 },
  ];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Weather & AI Farming</h1>
          <p className="text-gray-600 text-sm sm:text-base">Monitor weather conditions and analyze historical data</p>
        </div>

        <Tabs defaultValue="crops" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-max">
              <TabsTrigger value="crops" className="text-xs sm:text-sm px-2 sm:px-4">Crop & IoT</TabsTrigger>
              <TabsTrigger value="current" className="text-xs sm:text-sm px-2 sm:px-4">Current</TabsTrigger>
              <TabsTrigger value="forecast" className="text-xs sm:text-sm px-2 sm:px-4">Weather & GPS</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
              <TabsTrigger value="iot" className="text-xs sm:text-sm px-2 sm:px-4">IoT Network</TabsTrigger>
            </TabsList>
          </div>

          {/* Crop & IoT Management Tab */}
          <TabsContent value="crops" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Crop Management */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Sprout className="w-5 h-5" />
                    <span>Crop Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {dummyCrops.slice(0, 3).map((crop) => (
                    <div key={crop.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{crop.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{crop.type} - {crop.variety}</p>
                        </div>
                        <Badge 
                          variant={crop.health > 80 ? 'default' : crop.health > 60 ? 'secondary' : 'destructive'}
                          className="text-xs shrink-0 ml-2"
                        >
                          {crop.health}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-500">Stage</p>
                          <p className="font-medium">{crop.stage}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Progress</p>
                          <p className="font-medium">{crop.progress}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="font-medium truncate">{crop.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Area</p>
                          <p className="font-medium">{crop.area} ha</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Growth Progress</span>
                          <span>{crop.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all" 
                            style={{ width: `${crop.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* IoT Management */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Cpu className="w-5 h-5" />
                    <span>IoT Sensors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {dummyIoTSensors.map((sensor) => (
                    <div key={sensor.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {sensor.status === 'active' ? (
                            <Wifi className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <span className="font-medium text-sm truncate">{sensor.name}</span>
                        </div>
                        <Badge variant={sensor.status === 'active' ? 'default' : 'destructive'} className="text-xs shrink-0">
                          {sensor.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium">{sensor.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="font-medium truncate">{sensor.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reading</p>
                          <p className="font-medium">
                            {sensor.lastReading.value} {sensor.lastReading.unit}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Battery className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500">{sensor.batteryLevel}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(sensor.lastReading.timestamp).toLocaleString()}
                        </p>
                        <Button variant="outline" size="sm" className="text-xs shrink-0">
                          <Settings className="w-3 h-3 mr-1" />
                          Setup
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Integrated Weather and Crop Recommendations */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="w-5 h-5" />
                  <span>Weather-Based Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Irrigation Alert</h4>
                    <p className="text-xs sm:text-sm text-blue-800 mb-3">
                      Low soil moisture detected in North Field. Consider irrigation in next 24 hours.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto">
                      Schedule Irrigation
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-yellow-900 mb-2 text-sm sm:text-base">Weather Warning</h4>
                    <p className="text-xs sm:text-sm text-yellow-800 mb-3">
                      Heavy rainfall expected tomorrow. Check drainage systems and protect crops.
                    </p>
                    <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
                      View Details
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 md:col-span-2 lg:col-span-1">
                    <h4 className="font-medium text-green-900 mb-2 text-sm sm:text-base">Optimal Conditions</h4>
                    <p className="text-xs sm:text-sm text-green-800 mb-3">
                      Perfect weather for tomato cultivation. Consider expanding operations.
                    </p>
                    <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current" className="space-y-6">
            {/* Current Weather Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5" />
                    <span>Current Conditions</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Nairobi, Kenya</span>
                    <Badge variant="outline">GPS: -1.2921°, 36.8219°</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4">
                      <span className="text-6xl">{currentWeather.icon}</span>
                      <div>
                        <p className="text-4xl font-bold text-gray-900">{currentWeather.temperature}°C</p>
                        <p className="text-gray-600 text-lg">{currentWeather.condition}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-gray-600">Humidity</span>
                        </div>
                        <p className="text-2xl font-semibold">{currentWeather.humidity}%</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600">Rainfall</span>
                        </div>
                        <p className="text-2xl font-semibold">{currentWeather.rainfall}mm</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-600">Wind Speed</span>
                        </div>
                        <p className="text-2xl font-semibold">12 km/h</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Sun className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm text-gray-600">UV Index</span>
                        </div>
                        <p className="text-2xl font-semibold">6 (High)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">IoT Weather Sensors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dummyIoTSensors.filter(sensor => 
                    sensor.type === 'Temperature' || sensor.type === 'Soil Moisture'
                  ).map((sensor) => (
                    <div key={sensor.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{sensor.location}</span>
                        <Badge variant={sensor.status === 'active' ? 'default' : 'destructive'}>
                          {sensor.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {sensor.type === 'Temperature' ? (
                          <Thermometer className="w-4 h-4 text-red-500" />
                        ) : (
                          <Droplets className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-lg font-semibold">
                          {sensor.lastReading.value} {sensor.lastReading.unit}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sensor.lastReading.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            {/* Location Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Current Location Details</h4>
                    <p className="text-sm text-gray-600 mb-1">{currentLocationData?.label}</p>
                    <p className="text-sm text-gray-600">GPS: {currentLocationData?.coords}</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      Use Current Location
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>7-Day Weather Forecast</span>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {currentLocationData?.label} (GPS: {currentLocationData?.coords})</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weeklyForecast.map((day, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="font-medium text-gray-900 mb-2">{day.day}</p>
                      <div className="text-3xl mb-2">{day.condition}</div>
                      <p className="text-xl font-bold text-gray-900 mb-2">{day.temp}°C</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center justify-center space-x-1">
                          <Droplets className="w-3 h-3" />
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <Cloud className="w-3 h-3" />
                          <span>{day.rainfall}mm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced GPS and Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>GPS & Weather Station Network</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Geographical Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{currentLocationData?.label}</p>
                      <p className="text-sm text-gray-600">Coordinates: {currentLocationData?.coords}</p>
                      <p className="text-sm text-gray-600">Elevation: 1,795m</p>
                      <p className="text-sm text-gray-600">Time Zone: EAT (UTC+3)</p>
                      <p className="text-sm text-gray-600">Climate Zone: Tropical Highland</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">IoT Weather Sensors in Area</h5>
                      {dummyIoTSensors.filter(sensor => 
                        sensor.type === 'Temperature' || sensor.type === 'Soil Moisture'
                      ).map((sensor, index) => (
                        <div key={sensor.id} className="bg-white border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{sensor.name}</span>
                            <Badge variant={sensor.status === 'active' ? 'default' : 'destructive'}>
                              {sensor.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {sensor.location} - {sensor.lastReading.value}{sensor.lastReading.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Regional Weather Stations</h4>
                    <div className="space-y-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">JKIA Weather Station</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Distance: 12 km | Reliability: 98%</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Wilson Airport</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Distance: 8 km | Reliability: 95%</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Nairobi University</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Distance: 15 km | Reliability: 87%</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Weather Data Sources</h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Real-time IoT sensors: 12 active</p>
                        <p>• Meteorological stations: 3 active</p>
                        <p>• Satellite data: Updated hourly</p>
                        <p>• Crowd-sourced data: 47 contributors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Time Period Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Historical Data Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="temperature">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="rainfall">Rainfall</SelectItem>
                      <SelectItem value="all">All Metrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Temperature Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
                      {temperatureData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div className="text-xs font-medium">{data.temperature}°C</div>
                          <div 
                            className="w-6 bg-gradient-to-t from-blue-400 to-red-400 rounded-t"
                            style={{ height: `${(data.temperature / 30) * 120}px` }}
                          ></div>
                          <div className="text-xs text-gray-600">{data.date}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Min Temp</p>
                        <p className="font-semibold text-blue-600">
                          {Math.min(...historicalWeatherData.map(d => d.temperature))}°C
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Avg Temp</p>
                        <p className="font-semibold">
                          {Math.round(historicalWeatherData.reduce((sum, data) => sum + data.temperature, 0) / historicalWeatherData.length)}°C
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Max Temp</p>
                        <p className="font-semibold text-red-600">
                          {Math.max(...historicalWeatherData.map(d => d.temperature))}°C
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rainfall Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Droplets className="w-5 h-5" />
                    <span>Rainfall Patterns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
                      {historicalWeatherData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div className="text-xs font-medium">{data.rainfall}mm</div>
                          <div 
                            className="w-6 bg-blue-500 rounded-t"
                            style={{ height: `${(data.rainfall / 5) * 120}px` }}
                          ></div>
                          <div className="text-xs text-gray-600">
                            {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Total Rainfall</p>
                        <p className="font-semibold text-blue-600">
                          {historicalWeatherData.reduce((sum, data) => sum + data.rainfall, 0).toFixed(1)}mm
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Rainy Days</p>
                        <p className="font-semibold">
                          {historicalWeatherData.filter(d => d.rainfall > 0).length} days
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive Historical Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Weather Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 flex items-center space-x-2">
                      <Thermometer className="w-4 h-4" />
                      <span>Temperature</span>
                    </h5>
                    <p className="text-2xl font-bold text-blue-900">
                      {Math.round(historicalWeatherData.reduce((sum, data) => sum + data.temperature, 0) / historicalWeatherData.length)}°C
                    </p>
                    <p className="text-sm text-blue-700">Average (7 days)</p>
                    <div className="mt-2 text-xs text-blue-600">
                      <p>Range: {Math.min(...historicalWeatherData.map(d => d.temperature))}°C - {Math.max(...historicalWeatherData.map(d => d.temperature))}°C</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 flex items-center space-x-2">
                      <Droplets className="w-4 h-4" />
                      <span>Rainfall</span>
                    </h5>
                    <p className="text-2xl font-bold text-green-900">
                      {historicalWeatherData.reduce((sum, data) => sum + data.rainfall, 0).toFixed(1)}mm
                    </p>
                    <p className="text-sm text-green-700">Total (7 days)</p>
                    <div className="mt-2 text-xs text-green-600">
                      <p>Rainy days: {historicalWeatherData.filter(d => d.rainfall > 0).length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900 flex items-center space-x-2">
                      <Droplets className="w-4 h-4" />
                      <span>Humidity</span>
                    </h5>
                    <p className="text-2xl font-bold text-yellow-900">
                      {Math.round(historicalWeatherData.reduce((sum, data) => sum + data.humidity, 0) / historicalWeatherData.length)}%
                    </p>
                    <p className="text-sm text-yellow-700">Average (7 days)</p>
                    <div className="mt-2 text-xs text-yellow-600">
                      <p>Range: {Math.min(...historicalWeatherData.map(d => d.humidity))}% - {Math.max(...historicalWeatherData.map(d => d.humidity))}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="font-medium text-purple-900 flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Trends</span>
                    </h5>
                    <p className="text-lg font-bold text-purple-900">Stable</p>
                    <p className="text-sm text-purple-700">Weather Pattern</p>
                    <div className="mt-2 text-xs text-purple-600">
                      <p>Variation: Low</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Comparison & Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Year-over-Year Comparison</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">Average Temperature</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">24.3°C</span>
                          <Badge className="bg-green-100 text-green-800">+1.2°C</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">Total Rainfall</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">128.5mm</span>
                          <Badge className="bg-blue-100 text-blue-800">-15.3mm</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">Average Humidity</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">66.2%</span>
                          <Badge className="bg-yellow-100 text-yellow-800">+2.1%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Agricultural Insights</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-green-900">Optimal Planting</h5>
                        <p className="text-xs text-green-800 mt-1">
                          Current conditions are ideal for maize planting. Historical data shows 85% success rate.
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-blue-900">Irrigation Planning</h5>
                        <p className="text-xs text-blue-800 mt-1">
                          Rainfall patterns suggest supplemental irrigation needed in 2 weeks.
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-orange-900">Pest Risk</h5>
                        <p className="text-xs text-orange-800 mt-1">
                          High humidity levels may increase fungal disease risk. Monitor crops closely.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IoT Sensor Network Tab */}
          <TabsContent value="iot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5" />
                  <span>IoT Sensor Network Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900">Active Sensors</h4>
                    <p className="text-2xl font-bold text-green-900">
                      {dummyIoTSensors.filter(s => s.status === 'active').length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900">Maintenance</h4>
                    <p className="text-2xl font-bold text-yellow-900">
                      {dummyIoTSensors.filter(s => s.status === 'maintenance').length}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900">Offline</h4>
                    <p className="text-2xl font-bold text-red-900">
                      {dummyIoTSensors.filter(s => s.status === 'inactive').length}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900">Data Points</h4>
                    <p className="text-2xl font-bold text-blue-900">1,247</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sensor Details</h4>
                    <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by sensor type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Sensors</SelectItem>
                        <SelectItem value="Temperature">Temperature</SelectItem>
                        <SelectItem value="Soil Moisture">Soil Moisture</SelectItem>
                        <SelectItem value="Soil pH">Soil pH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dummyIoTSensors
                      .filter(sensor => !selectedSensor || sensor.type === selectedSensor)
                      .map((sensor) => (
                      <div key={sensor.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {sensor.status === 'active' ? (
                              <Wifi className="w-4 h-4 text-green-500" />
                            ) : sensor.status === 'maintenance' ? (
                              <Settings className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium">{sensor.name}</span>
                          </div>
                          <Badge 
                            variant={
                              sensor.status === 'active' ? 'default' : 
                              sensor.status === 'maintenance' ? 'secondary' : 'destructive'
                            }
                          >
                            {sensor.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="font-medium">{sensor.type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">{sensor.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Current Reading</p>
                            <p className="font-medium text-lg">
                              {sensor.lastReading.value} {sensor.lastReading.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Battery</p>
                            <div className="flex items-center space-x-2">
                              <Battery className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{sensor.batteryLevel}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Last updated: {new Date(sensor.lastReading.timestamp).toLocaleString()}</span>
                          <Button variant="outline" size="sm">
                            View History
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}