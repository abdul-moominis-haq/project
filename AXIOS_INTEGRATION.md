# Axios API Integration Documentation

## Overview
This document outlines the Axios integration implemented throughout the SmartAgri project. All API calls are currently commented out and the application uses dummy data for development and testing purposes.

## Files Added/Modified

### 1. API Service Layer (`/services/api.ts`)
**Purpose**: Centralized API service using Axios with interceptors for authentication and error handling.

**Features**:
- Base Axios configuration with timeout and headers
- Request interceptor for automatic token attachment
- Response interceptor for global error handling (401 redirects)
- Organized API endpoints by functionality:
  - `authAPI` - Authentication endpoints
  - `weatherAPI` - Weather and forecast data
  - `cropsAPI` - Crop management
  - `sensorsAPI` - IoT sensor operations
  - `communityAPI` - Community posts and interactions
  - `locationAPI` - Geolocation services
  - `advisoryAPI` - AI recommendations and chat

**Configuration**:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
```

### 2. Authentication Hook (`/hooks/useAuth.tsx`)
**Purpose**: React context and hook for user authentication state management.

**Features**:
- User authentication state management
- Login, register, logout, and update user functions
- Automatic token checking on app initialization
- Integration with API service (commented out)

### 3. API Call Hook (`/hooks/useApiCall.ts`)
**Purpose**: Custom hooks for managing API call states and error handling.

**Hooks Included**:
- `useApiCall<T>` - Single API call with loading/error states
- `useMultipleApiCalls` - Handle multiple API calls simultaneously
- `usePeriodicApiCall<T>` - Periodic API calls (polling)

### 4. Updated Components

#### Crops Page (`/app/crops/page.tsx`)
- Added `useEffect` for data loading on component mount
- Updated `handleAddCrop` with API integration (commented out)
- Updated `handleAddSensor` with API integration (commented out)
- Updated `sendChatMessage` with AI API integration (commented out)
- Added loading states and error handling

#### Weather Page (`/app/weather/page.tsx`)
- Added weather data loading functions
- Updated geolocation with API reverse geocoding (commented out)
- Added state management for weather, historical, and forecast data
- API integration for location-based weather updates

#### Login Page (`/app/login/page.tsx`)
- Updated authentication to use API service (commented out)
- Added proper error handling and loading states
- Maintains dummy authentication for development

#### Community Page (`/app/community/page.tsx`)
- Added imports for API services and hooks (commented out)
- Ready for community API integration

### 5. Package.json Updates
- Added `axios: ^1.6.0` dependency

## API Endpoints Structure

### Authentication
```typescript
authAPI.login(email, password)
authAPI.register(userData)
authAPI.logout()
authAPI.getCurrentUser()
```

### Weather
```typescript
weatherAPI.getCurrentWeather(location?)
weatherAPI.getWeatherForecast(days, location?)
weatherAPI.getHistoricalWeather(startDate, endDate, location?)
weatherAPI.getAIPredictions(timeframe, location?)
```

### Crops
```typescript
cropsAPI.getCrops(userId)
cropsAPI.createCrop(cropData)
cropsAPI.updateCrop(cropId, cropData)
cropsAPI.deleteCrop(cropId)
cropsAPI.getCropAnalytics(cropId)
```

### IoT Sensors
```typescript
sensorsAPI.getSensors(userId)
sensorsAPI.createSensor(sensorData)
sensorsAPI.updateSensor(sensorId, sensorData)
sensorsAPI.deleteSensor(sensorId)
sensorsAPI.getSensorHistory(sensorId, startDate, endDate)
```

### Community
```typescript
communityAPI.getPosts(page, limit)
communityAPI.createPost(postData)
communityAPI.toggleLike(postId)
communityAPI.addComment(postId, comment)
```

### Location Services
```typescript
locationAPI.reverseGeocode(lat, lng)
locationAPI.getNearbyWeatherStations(lat, lng, radius)
```

### AI/Advisory
```typescript
advisoryAPI.getAdvisories(cropType?, location?)
advisoryAPI.getAIChatResponse(message, context?)
advisoryAPI.getCropRecommendations(weatherData, soilData, location)
```

## Environment Variables Required

Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Activation Instructions

To activate the API integration:

1. **Uncomment API imports** in all files:
   ```typescript
   import { cropsAPI, sensorsAPI, advisoryAPI } from '@/services/api';
   import { useAuth } from '@/hooks/useAuth';
   ```

2. **Uncomment API calls** and comment out dummy data usage:
   ```typescript
   // Uncomment this:
   // const cropsData = await cropsAPI.getCrops(userId);
   // setCrops(cropsData);
   
   // Comment out this:
   setCrops(dummyCrops);
   ```

3. **Set up backend API** that matches the endpoint structure

4. **Update API base URL** in environment variables

5. **Test authentication flow** first, then gradually enable other endpoints

## Error Handling

All API calls include proper error handling:
- Network errors
- HTTP error responses
- Authentication failures (401 redirects)
- Validation errors
- Timeout errors

## Security Features

- Automatic JWT token management
- Secure token storage in localStorage
- Request/response interceptors
- CORS handling
- Input validation (to be implemented in backend)

## Next Steps

1. Implement backend API endpoints
2. Set up authentication server
3. Configure database connections
4. Add input validation schemas
5. Implement rate limiting
6. Add API documentation (Swagger/OpenAPI)
7. Set up monitoring and logging
8. Configure deployment environment variables

## Development Notes

- All API calls are currently commented out
- Dummy data remains active for development
- Error boundaries should be added for production
- Loading states are implemented and ready
- TypeScript interfaces match expected API responses
