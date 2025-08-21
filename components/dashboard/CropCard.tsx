import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sprout, Calendar, Target, Activity } from 'lucide-react';
import { DatabaseCrop } from '@/types';

interface CropCardProps {
  crop: DatabaseCrop;
  onViewDetails: (crop: DatabaseCrop) => void;
}

export function CropCard({ crop, onViewDetails }: CropCardProps) {
  const getHealthColor = (health: number | undefined) => {
    const healthValue = health ?? 0;
    if (healthValue >= 80) return 'text-green-600 bg-green-50';
    if (healthValue >= 60) return 'text-yellow-600 bg-yellow-50';
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
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg truncate">{crop.crop_type?.name || 'Unknown Crop'}</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{crop.crop_type?.category} - {crop.variety}</p>
          </div>
          <Badge className={`${getHealthColor(crop.health_score)} text-xs shrink-0 ml-2`}>
            {crop.health_score}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Growth Progress</span>
            <span className="font-medium">{crop.progress_percentage}%</span>
          </div>
          <Progress value={crop.progress_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <div className="min-w-0">
              <p className="text-gray-600">Planted</p>
              <p className="font-medium truncate">{formatDate(crop.planting_date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <div className="min-w-0">
              <p className="text-gray-600">Harvest</p>
              <p className="font-medium">{getDaysToHarvest(crop.expected_harvest_date || '')} days</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 pt-2 border-t">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-gray-600">Stage:</span>
            <Badge variant="outline" className="text-xs">{crop.growth_stage || crop.status}</Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewDetails(crop)}
            className="text-xs sm:text-sm"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}