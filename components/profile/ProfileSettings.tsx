'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Shield, 
  Globe, 
  Smartphone, 
  Mail,
  MessageSquare,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  Trash2
} from 'lucide-react';

interface ProfileSettingsProps {
  preferences: any;
  onPreferenceChange: (category: string, key: string, value: any) => void;
}

export function ProfileSettings({ preferences, onPreferenceChange }: ProfileSettingsProps) {
  const notificationSettings = [
    {
      key: 'email',
      title: 'Email Notifications',
      description: 'Receive updates via email',
      icon: Mail
    },
    {
      key: 'sms',
      title: 'SMS Notifications',
      description: 'Receive text messages for urgent alerts',
      icon: MessageSquare
    },
    {
      key: 'push',
      title: 'Push Notifications',
      description: 'Browser and app notifications',
      icon: Bell
    },
    {
      key: 'weather',
      title: 'Weather Alerts',
      description: 'Weather warnings and forecasts',
      icon: AlertTriangle
    },
    {
      key: 'harvest',
      title: 'Harvest Reminders',
      description: 'Notifications about crop harvest times',
      icon: Bell
    },
    {
      key: 'maintenance',
      title: 'Equipment Maintenance',
      description: 'IoT sensor and equipment alerts',
      icon: Bell
    }
  ];

  const privacySettings = [
    {
      key: 'dataSharing',
      title: 'Data Sharing',
      description: 'Share anonymized data to improve services'
    },
    {
      key: 'analytics',
      title: 'Analytics',
      description: 'Allow analytics to improve user experience'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationSettings.map((setting) => {
            const IconComponent = setting.icon;
            return (
              <div key={setting.key} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="font-medium">
                      {setting.title}
                    </Label>
                    <Switch
                      id={setting.key}
                      checked={preferences.notifications[setting.key]}
                      onCheckedChange={(checked) => onPreferenceChange('notifications', setting.key, checked)}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Profile Visibility</Label>
              <p className="text-sm text-gray-500 mt-1">Control who can see your profile</p>
              <div className="mt-3 space-y-2">
                {['public', 'farmers', 'private'].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option}
                      checked={preferences.privacy.profileVisibility === option}
                      onChange={(e) => onPreferenceChange('privacy', 'profileVisibility', e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {privacySettings.map((setting) => (
              <div key={setting.key} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="font-medium">
                      {setting.title}
                    </Label>
                    <Switch
                      id={setting.key}
                      checked={preferences.privacy[setting.key]}
                      onCheckedChange={(checked) => onPreferenceChange('privacy', setting.key, checked)}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-purple-600" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Download My Data
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
          <p className="text-xs text-gray-500">
            Download all your data or permanently delete your account. These actions cannot be undone.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-orange-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-20 flex-col">
              <Eye className="w-5 h-5 mb-2" />
              <span className="text-xs">View Activity</span>
            </Button>
            <Button variant="outline" size="sm" className="h-20 flex-col">
              <Shield className="w-5 h-5 mb-2" />
              <span className="text-xs">Security Log</span>
            </Button>
            <Button variant="outline" size="sm" className="h-20 flex-col">
              <Globe className="w-5 h-5 mb-2" />
              <span className="text-xs">Export Data</span>
            </Button>
            <Button variant="outline" size="sm" className="h-20 flex-col">
              <Bell className="w-5 h-5 mb-2" />
              <span className="text-xs">Test Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
