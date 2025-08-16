import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sprout, Calendar, Target, Activity } from 'lucide-react';
import { Crop } from '@/types';

interface CropCardProps {
  crop: Crop;
  onViewDetails: (crop: Crop) => void;
}

export function CropCard({ crop, onViewDetails }: CropCardProps) {
  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600 bg-green-50';
    if (health >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysToHarvest = (harvestDate: string) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{crop.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{crop.type} - {crop.variety}</p>
          </div>
          <Badge className={getHealthColor(crop.health)}>
            {crop.health}% Health
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Growth Progress</span>
            <span className="font-medium">{crop.progress}%</span>
          </div>
          <Progress value={crop.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Planted</p>
              <p className="font-medium">{formatDate(crop.datePlanted)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Harvest</p>
              <p className="font-medium">{getDaysToHarvest(crop.expectedHarvest)} days</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2 text-sm">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Stage:</span>
            <Badge variant="outline">{crop.stage}</Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewDetails(crop)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}