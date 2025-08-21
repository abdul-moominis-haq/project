'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain
} from 'lucide-react';
import { WeatherPredictionData, ExtendedWeatherPrediction } from '@/types';

interface PredictionDisplayProps {
  prediction: ExtendedWeatherPrediction;
  index?: number;
}

const PredictionCard: React.FC<PredictionDisplayProps> = ({ prediction, index }) => {
  const avgTemp = (prediction.Minimum_Temperature + prediction.Maximum_Temperature) / 2;
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{index ? `Day ${index}` : 'Prediction'} - {prediction.Date}</span>
          </span>
          <Badge variant={prediction.weather_condition === 'Clear' ? 'default' : 'secondary'}>
            {prediction.weather_condition}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="font-semibold">{prediction.Minimum_Temperature}°C - {prediction.Maximum_Temperature}°C</p>
              <p className="text-xs text-gray-500">Avg: {avgTemp.toFixed(1)}°C</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="font-semibold">{prediction.Average_Relative_Humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Cloud Cover</p>
              <p className="font-semibold">{prediction.Cloud_Cover}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Pressure</p>
              <p className="font-semibold">{prediction.Station_Level_Pressure} hPa</p>
            </div>
          </div>
        </div>

        {prediction.predicted_rainfall !== undefined && (
          <div className="mb-3">
            <Badge variant="outline" className="text-blue-600">
              Estimated Rainfall: {prediction.predicted_rainfall?.toFixed(1)}mm
            </Badge>
          </div>
        )}

        {prediction.farming_recommendations && prediction.farming_recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
              <Brain className="w-4 h-4" />
              <span>Farming Recommendations</span>
            </h4>
            <div className="space-y-1">
              {prediction.farming_recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  {rec.includes('alert') || rec.includes('warning') || rec.includes('risk') ? (
                    <AlertTriangle className="w-3 h-3 text-orange-500 mt-1 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                  )}
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const WeatherPredictionsTab: React.FC = () => {
  const [predictionInput, setPredictionInput] = useState('');
  const [processedPredictions, setProcessedPredictions] = useState<ExtendedWeatherPrediction[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('Greater Accra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample data for demonstration
  const sampleData = `{
  "Average_Relative_Humidity": 78.5,
  "Minimum_Temperature": 22.3,
  "Maximum_Temperature": 29.7,
  "Cloud_Cover": 6,
  "Station_Level_Pressure": 1012.5,
  "Date": "2025-08-17"
}`;

  const regions = [
'Greater Accra','Ashanti','Northern','Central','Volta','Upper West','Upper East','Bono','Bono East','Ahafo','Western','Western North','Eastern','Oti','North East','Savannah'
];


  const processPredictionData = async () => {
    if (!predictionInput.trim()) {
      setError('Please enter prediction data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = JSON.parse(predictionInput);
      const response = await fetch('/api/weather/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          region: selectedRegion,
          format: 'processed'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process prediction data');
      }

      const result = await response.json();
      
      if (result.processed) {
        setProcessedPredictions([result.processed]);
      } else if (result.daily_predictions) {
        setProcessedPredictions(result.daily_predictions.map((p: any) => p.processed));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process data');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setPredictionInput(sampleData);
  };

  const loadMultiDayData = () => {
    const multiDayData = `[
  {
    "Average_Relative_Humidity": 78.5,
    "Minimum_Temperature": 22.3,
    "Maximum_Temperature": 29.7,
    "Cloud_Cover": 6,
    "Station_Level_Pressure": 1012.5,
    "Date": "2025-08-17"
  },
  {
    "Average_Relative_Humidity": 82.1,
    "Minimum_Temperature": 21.8,
    "Maximum_Temperature": 28.4,
    "Cloud_Cover": 45,
    "Station_Level_Pressure": 1008.3,
    "Date": "2025-08-18"
  },
  {
    "Average_Relative_Humidity": 75.2,
    "Minimum_Temperature": 23.1,
    "Maximum_Temperature": 31.2,
    "Cloud_Cover": 15,
    "Station_Level_Pressure": 1015.7,
    "Date": "2025-08-19"
  }
]`;
    setPredictionInput(multiDayData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Weather Prediction Data Processor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Region
            </label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prediction Data (JSON Format)
            </label>
            <Textarea
              value={predictionInput}
              onChange={(e) => setPredictionInput(e.target.value)}
              placeholder="Enter your weather prediction data in JSON format..."
              className="min-h-32 font-mono text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={loadSampleData} variant="outline" size="sm">
              Load Sample Data
            </Button>
            <Button onClick={loadMultiDayData} variant="outline" size="sm">
              Load Multi-Day Sample
            </Button>
            <Button 
              onClick={processPredictionData} 
              disabled={loading}
              className="flex-1 min-w-32"
            >
              {loading ? 'Processing...' : 'Process Prediction Data'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {processedPredictions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Processed Predictions for {selectedRegion}
          </h3>
          <div className="space-y-4">
            {processedPredictions.map((prediction, index) => (
              <PredictionCard 
                key={index} 
                prediction={prediction} 
                index={processedPredictions.length > 1 ? index + 1 : undefined}
              />
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expected Data Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`{
  "Average_Relative_Humidity": 78.5,
  "Minimum_Temperature": 22.3,
  "Maximum_Temperature": 29.7,
  "Cloud_Cover": 6,
  "Station_Level_Pressure": 1012.5,
  "Date": "2025-08-17"
}`}
            </pre>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            For multiple days, wrap the objects in an array: <code>[{'{...}'}, {'{...}'}]</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
