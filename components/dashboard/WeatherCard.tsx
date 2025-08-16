import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Droplets, Thermometer } from 'lucide-react';
import { Weather, WeatherForecast } from '@/types';

interface WeatherCardProps {
  current: Weather;
  forecast: WeatherForecast;
}

export function WeatherCard({ current, forecast }: WeatherCardProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <span>Weather Conditions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Weather */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Today</h3>
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{current.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{current.temperature}°C</p>
                <p className="text-gray-600">{current.condition}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-blue-500" />
                <span>Humidity: {current.humidity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>Rainfall: {current.rainfall}mm</span>
              </div>
            </div>
          </div>

          {/* Tomorrow's Forecast */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tomorrow</h3>
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{forecast.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{forecast.temperature}°C</p>
                <p className="text-gray-600">{forecast.condition}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-blue-500" />
                <span>Humidity: {forecast.humidity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>Rainfall: {forecast.rainfall}mm</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}