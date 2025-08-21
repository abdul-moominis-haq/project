'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedForecastData } from '@/services/weather-forecast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherChartsProps {
  forecast: ProcessedForecastData | null;
  className?: string;
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ forecast, className = '' }) => {
  if (!forecast) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Temperature Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Temperature Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={{
              labels: forecast.daily.map(day => day.day),
              datasets: [
                {
                  label: 'Maximum Temperature',
                  data: forecast.daily.map(day => day.tempMax),
                  borderColor: 'rgb(239, 68, 68)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  fill: true,
                  tension: 0.4
                },
                {
                  label: 'Minimum Temperature',
                  data: forecast.daily.map(day => day.tempMin),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                  tension: 0.4
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Temperature Trends'
                }
              },
              scales: {
                y: {
                  type: 'linear' as const,
                  display: true,
                  position: 'left' as const,
                  title: {
                    display: true,
                    text: 'Temperature (°C)'
                  }
                }
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Rainfall and Humidity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Rainfall & Humidity</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: forecast.daily.map(day => day.day),
              datasets: [
                {
                  label: 'Rainfall (mm)',
                  data: forecast.daily.map(day => day.rainfall),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  yAxisID: 'y1',
                },
                {
                  label: 'Humidity (%)',
                  data: forecast.daily.map(day => day.humidity),
                  backgroundColor: 'rgba(167, 139, 250, 0.5)',
                  yAxisID: 'y2',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Rainfall & Humidity'
                }
              },
              scales: {
                y1: {
                  type: 'linear' as const,
                  display: true,
                  position: 'left' as const,
                  title: {
                    display: true,
                    text: 'Rainfall (mm)'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
                },
                y2: {
                  type: 'linear' as const,
                  display: true,
                  position: 'right' as const,
                  title: {
                    display: true,
                    text: 'Humidity (%)'
                  }
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherCharts;
