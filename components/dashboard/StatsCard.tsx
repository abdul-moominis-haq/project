import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isUpward: boolean;
  };
}

export function StatsCard({ title, value, icon, description, trend }: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium truncate mr-2">{title}</CardTitle>
        <div className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-lg sm:text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs ${trend.isUpward ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isUpward ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}