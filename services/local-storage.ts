// Local storage service for persisting user activities and data
import React from 'react';

export interface UserActivity {
  id: string;
  type: 'chat' | 'profile_update' | 'crop_add' | 'crop_update' | 'weather_check' | 'settings_change' | 'navigation';
  timestamp: string;
  data: any;
  userId?: string;
}

export interface StoredUserData {
  profile: any;
  preferences: any;
  chatHistory: any[];
  crops: any[];
  activities: UserActivity[];
  weatherHistory: any[];
  lastSync: string;
  settings: any;
}

class LocalStorageService {
  private readonly STORAGE_KEY = 'ghana_farm_app_data';
  private readonly ACTIVITY_KEY = 'ghana_farm_activities';
  private readonly MAX_ACTIVITIES = 1000; // Limit stored activities

  // Initialize storage for a user
  initializeUser(userId: string): void {
    const userKey = `${this.STORAGE_KEY}_${userId}`;
    const existing = localStorage.getItem(userKey);
    
    if (!existing) {
      const initialData: StoredUserData = {
        profile: null,
        preferences: {},
        chatHistory: [],
        crops: [],
        activities: [],
        weatherHistory: [],
        lastSync: new Date().toISOString(),
        settings: {
          theme: 'light',
          language: 'en',
          notifications: true,
          autoSave: true
        }
      };
      localStorage.setItem(userKey, JSON.stringify(initialData));
      console.log('Initialized local storage for user:', userId);
    }
  }

  // Get all stored data for a user
  getUserData(userId: string): StoredUserData | null {
    try {
      const userKey = `${this.STORAGE_KEY}_${userId}`;
      const data = localStorage.getItem(userKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  // Save user data
  saveUserData(userId: string, data: Partial<StoredUserData>): void {
    try {
      const userKey = `${this.STORAGE_KEY}_${userId}`;
      const existing = this.getUserData(userId) || {} as StoredUserData;
      const updated = {
        ...existing,
        ...data,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem(userKey, JSON.stringify(updated));
      console.log('Saved user data locally for:', userId);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Record user activity
  recordActivity(userId: string, activity: Omit<UserActivity, 'id' | 'timestamp' | 'userId'>): void {
    try {
      const userData = this.getUserData(userId);
      if (!userData) {
        this.initializeUser(userId);
        return this.recordActivity(userId, activity);
      }

      const newActivity: UserActivity = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        userId,
        ...activity
      };

      // Add to activities array, keep only recent ones
      userData.activities = userData.activities || [];
      userData.activities.unshift(newActivity);
      
      // Trim to max activities
      if (userData.activities.length > this.MAX_ACTIVITIES) {
        userData.activities = userData.activities.slice(0, this.MAX_ACTIVITIES);
      }

      this.saveUserData(userId, userData);
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  }

  // Save chat message
  saveChatMessage(userId: string, message: any): void {
    try {
      const userData = this.getUserData(userId);
      if (!userData) {
        this.initializeUser(userId);
        return this.saveChatMessage(userId, message);
      }

      userData.chatHistory = userData.chatHistory || [];
      userData.chatHistory.unshift({
        ...message,
        id: Date.now().toString(),
        savedAt: new Date().toISOString()
      });

      // Keep only last 100 messages
      if (userData.chatHistory.length > 100) {
        userData.chatHistory = userData.chatHistory.slice(0, 100);
      }

      this.saveUserData(userId, userData);
      
      // Record activity
      this.recordActivity(userId, {
        type: 'chat',
        data: { messageType: message.role, content: message.content?.substring(0, 100) }
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  // Get chat history
  getChatHistory(userId: string): any[] {
    const userData = this.getUserData(userId);
    return userData?.chatHistory || [];
  }

  // Save profile data
  saveProfile(userId: string, profile: any): void {
    try {
      this.saveUserData(userId, { profile });
      this.recordActivity(userId, {
        type: 'profile_update',
        data: { fields: Object.keys(profile) }
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  // Get profile data
  getProfile(userId: string): any {
    const userData = this.getUserData(userId);
    return userData?.profile;
  }

  // Save crop data
  saveCrop(userId: string, crop: any): void {
    try {
      const userData = this.getUserData(userId);
      if (!userData) {
        this.initializeUser(userId);
        return this.saveCrop(userId, crop);
      }

      userData.crops = userData.crops || [];
      const existingIndex = userData.crops.findIndex(c => c.id === crop.id);
      
      if (existingIndex >= 0) {
        userData.crops[existingIndex] = { ...crop, updatedAt: new Date().toISOString() };
        this.recordActivity(userId, {
          type: 'crop_update',
          data: { cropName: crop.name, action: 'updated' }
        });
      } else {
        userData.crops.push({ ...crop, createdAt: new Date().toISOString() });
        this.recordActivity(userId, {
          type: 'crop_add',
          data: { cropName: crop.name, action: 'added' }
        });
      }

      this.saveUserData(userId, userData);
    } catch (error) {
      console.error('Error saving crop:', error);
    }
  }

  // Get crops
  getCrops(userId: string): any[] {
    const userData = this.getUserData(userId);
    return userData?.crops || [];
  }

  // Save weather check
  saveWeatherCheck(userId: string, weatherData: any): void {
    try {
      const userData = this.getUserData(userId);
      if (!userData) {
        this.initializeUser(userId);
        return this.saveWeatherCheck(userId, weatherData);
      }

      userData.weatherHistory = userData.weatherHistory || [];
      userData.weatherHistory.unshift({
        ...weatherData,
        checkedAt: new Date().toISOString()
      });

      // Keep only last 50 weather checks
      if (userData.weatherHistory.length > 50) {
        userData.weatherHistory = userData.weatherHistory.slice(0, 500);
      }

      this.saveUserData(userId, userData);
      this.recordActivity(userId, {
        type: 'weather_check',
        data: { location: weatherData.location, temperature: weatherData.temperature }
      });
    } catch (error) {
      console.error('Error saving weather check:', error);
    }
  }

  // Save preferences
  savePreferences(userId: string, preferences: any): void {
    try {
      this.saveUserData(userId, { preferences });
      this.recordActivity(userId, {
        type: 'settings_change',
        data: { updatedFields: Object.keys(preferences) }
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  // Get preferences
  getPreferences(userId: string): any {
    const userData = this.getUserData(userId);
    return userData?.preferences || {};
  }

  // Record navigation
  recordNavigation(userId: string, page: string): void {
    this.recordActivity(userId, {
      type: 'navigation',
      data: { page, timestamp: new Date().toISOString() }
    });
  }

  // Get recent activities
  getRecentActivities(userId: string, limit: number = 20): UserActivity[] {
    const userData = this.getUserData(userId);
    return userData?.activities?.slice(0, limit) || [];
  }

  // Export user data (for backup)
  exportUserData(userId: string): string {
    const userData = this.getUserData(userId);
    return JSON.stringify(userData, null, 2);
  }

  // Import user data (from backup)
  importUserData(userId: string, dataString: string): boolean {
    try {
      const data = JSON.parse(dataString);
      this.saveUserData(userId, data);
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }

  // Clear user data
  clearUserData(userId: string): void {
    try {
      const userKey = `${this.STORAGE_KEY}_${userId}`;
      localStorage.removeItem(userKey);
      console.log('Cleared local data for user:', userId);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_KEY)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
      
      // Estimate total available (usually ~5-10MB)
      const total = 5 * 1024 * 1024; // 5MB estimate
      const percentage = (used / total) * 100;
      
      return { used, total, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

// Create singleton instance
export const localStorageService = new LocalStorageService();

// Auto-save hook for React components
export const useAutoSave = (userId: string) => {
  const [isEnabled, setIsEnabled] = React.useState(true);
  
  React.useEffect(() => {
    // Initialize user storage when hook is used
    if (userId && isEnabled) {
      localStorageService.initializeUser(userId);
    }
  }, [userId, isEnabled]);

  return {
    saveProfile: (profile: any) => localStorageService.saveProfile(userId, profile),
    saveChatMessage: (message: any) => localStorageService.saveChatMessage(userId, message),
    saveCrop: (crop: any) => localStorageService.saveCrop(userId, crop),
    savePreferences: (prefs: any) => localStorageService.savePreferences(userId, prefs),
    recordNavigation: (page: string) => localStorageService.recordNavigation(userId, page),
    recordActivity: (activity: any) => localStorageService.recordActivity(userId, activity),
    isEnabled,
    setIsEnabled
  };
};

export default localStorageService;
