'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/ui/search-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/local-storage';
import openWeatherService, { ProcessedWeatherData, WeatherRecommendation } from '@/services/openweather-api';
// Import API services (commented out for now)
// import { cropsAPI, sensorsAPI, advisoryAPI } from '@/services/api';
import { 
  Plus, 
  Sprout, 
  Wifi, 
  Bot, 
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Battery,
  AlertTriangle,
  Calendar,
  Target,
  TrendingUp,
  Settings,
  Send,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { dummyCrops, dummyIoTSensors } from '@/lib/dummy-data';
import { Crop, IoTSensor } from '@/types';

export default function CropsPage() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>(dummyCrops);
  const [sensors, setSensors] = useState<IoTSensor[]>(dummyIoTSensors);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [isAddSensorOpen, setIsAddSensorOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', message: 'Hello! I am your AI farming assistant. How can I help you optimize your crops today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Weather state for crop recommendations
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [cropWeatherRecommendations, setCropWeatherRecommendations] = useState<{[cropId: string]: WeatherRecommendation[]}>({});
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Track navigation to crops page
  useEffect(() => {
    if (user?.id) {
      localStorageService.recordNavigation(user.id, 'crops');
    }
  }, [user]);

  // Load data on component mount
  useEffect(() => {
    loadCropsData();
    loadSensorsData();
    loadWeatherData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load weather data for crop recommendations
  const loadWeatherData = async () => {
    setLoadingWeather(true);
    try {
      // Default to Accra, Ghana for weather data
      const weather = await openWeatherService.getCurrentWeatherByCity('Accra', 'GH');
      setWeatherData(weather);
      
      // Generate crop-specific recommendations
      const recommendations: {[cropId: string]: WeatherRecommendation[]} = {};
      crops.forEach(crop => {
        recommendations[crop.id] = openWeatherService.getCropRecommendations(crop.type, weather);
      });
      setCropWeatherRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading weather data:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  // API Functions (commented out for now, using dummy data)
  const loadCropsData = async () => {
    setLoading(true);
    try {
      // const userId = '1'; // Get from auth context
      // const cropsData = await cropsAPI.getCrops(userId);
      // setCrops(cropsData);
      
      // Using dummy data for now
      setCrops(dummyCrops);
    } catch (error) {
      console.error('Error loading crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSensorsData = async () => {
    try {
      // const userId = '1'; // Get from auth context
      // const sensorsData = await sensorsAPI.getSensors(userId);
      // setSensors(sensorsData);
      
      // Using dummy data for now
      setSensors(dummyIoTSensors);
    } catch (error) {
      console.error('Error loading sensors:', error);
    }
  };
  
  const [newCrop, setNewCrop] = useState({
    name: '',
    type: '',
    variety: '',
    datePlanted: '',
    expectedHarvest: '',
    area: '',
    location: '',
    stage: 'Seedling',
    health: 85,
    progress: 15
  });

  const [newSensor, setNewSensor] = useState({
    name: '',
    type: '',
    location: ''
  });

  // Filter crops based on search
  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter sensors based on search
  const filteredSensors = sensors.filter(sensor => 
    sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sensor.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sensor.location.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const cropData = {
        name: newCrop.name,
        type: newCrop.type,
        variety: newCrop.variety,
        datePlanted: newCrop.datePlanted,
        expectedHarvest: newCrop.expectedHarvest,
        stage: newCrop.stage,
        location: newCrop.location,
        area: parseFloat(newCrop.area)
      };

      // API call (commented out for now)
      // const newCropData = await cropsAPI.createCrop(cropData);
      // setCrops([...crops, newCropData]);

      // Using dummy data for now
      const crop: Crop = {
        id: (crops.length + 1).toString(),
        ...cropData,
        health: 85,
        progress: 15
      };
      setCrops([...crops, crop]);

      // Save crop to local storage and record activity
      if (user?.id) {
        localStorageService.saveCrop(user.id, crop);
        localStorageService.recordActivity(user.id, {
          type: 'crop_add',
          data: {
            cropName: crop.name,
            cropType: crop.type,
            variety: crop.variety,
            area: crop.area,
            location: crop.location
          }
        });
      }

      // Reset form
      setNewCrop({
        name: '',
        type: '',
        variety: '',
        datePlanted: '',
        expectedHarvest: '',
        area: '',
        location: '',
        stage: 'Seedling',
        health: 85,
        progress: 15
      });
      setIsAddCropOpen(false);
      setAlertMessage({type: 'success', message: `${crop.name} has been added successfully!`});
      setTimeout(() => setAlertMessage(null), 5000);
    } catch (error) {
      console.error('Error adding crop:', error);
      setAlertMessage({type: 'error', message: 'Failed to add crop. Please try again.'});
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const sensorData = {
        name: newSensor.name,
        type: newSensor.type,
        location: newSensor.location
      };

      // API call (commented out for now)
      // const newSensorData = await sensorsAPI.createSensor(sensorData);
      // setSensors([...sensors, newSensorData]);

      // Using dummy data for now
      const sensor: IoTSensor = {
        id: (sensors.length + 1).toString(),
        ...sensorData,
        batteryLevel: Math.floor(Math.random() * 100),
        status: 'active',
        lastReading: {
          timestamp: new Date().toISOString(),
          value: Math.floor(Math.random() * 100),
          unit: newSensor.type === 'Temperature' ? '°C' : newSensor.type === 'Humidity' ? '%' : 'pH'
        }
      };
      setSensors([...sensors, sensor]);

      // Reset form
      setNewSensor({
        name: '',
        type: '',
        location: ''
      });
      setIsAddSensorOpen(false);
      setAlertMessage({type: 'success', message: `${sensor.name} has been added successfully!`});
      setTimeout(() => setAlertMessage(null), 5000);
    } catch (error) {
      console.error('Error adding sensor:', error);
      setAlertMessage({type: 'error', message: 'Failed to add sensor. Please try again.'});
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    const cropToDelete = crops.find(crop => crop.id === cropId);
    if (!confirm(`Are you sure you want to delete "${cropToDelete?.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    
    try {
      // API call (commented out for now)
      // await cropsAPI.deleteCrop(cropId);
      
      // Using dummy data for now
      setCrops(crops.filter(crop => crop.id !== cropId));
      setAlertMessage({type: 'success', message: `${cropToDelete?.name} has been deleted successfully.`});
      setTimeout(() => setAlertMessage(null), 5000);
    } catch (error) {
      console.error('Error deleting crop:', error);
      setAlertMessage({type: 'error', message: 'Failed to delete crop. Please try again.'});
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSensor = async (sensorId: string) => {
    const sensorToDelete = sensors.find(sensor => sensor.id === sensorId);
    if (!confirm(`Are you sure you want to delete "${sensorToDelete?.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    
    try {
      // API call (commented out for now)
      // await sensorsAPI.deleteSensor(sensorId);
      
      // Using dummy data for now
      setSensors(sensors.filter(sensor => sensor.id !== sensorId));
      setAlertMessage({type: 'success', message: `${sensorToDelete?.name} has been deleted successfully.`});
      setTimeout(() => setAlertMessage(null), 5000);
    } catch (error) {
      console.error('Error deleting sensor:', error);
      setAlertMessage({type: 'error', message: 'Failed to delete sensor. Please try again.'});
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = { role: 'user', message: chatMessage };
    setChatHistory([...chatHistory, newMessage]);
    
    try {
      // API call (commented out for now)
      // const response = await advisoryAPI.getAIChatResponse(chatMessage, {
      //   crops: crops,
      //   sensors: sensors,
      //   location: 'Nairobi, Kenya'
      // });
      // const aiResponse = {
      //   role: 'assistant',
      //   message: response.response
      // };
      // setChatHistory(prev => [...prev, aiResponse]);

      // Simulate AI response for now
      setTimeout(() => {
        const responses = [
          "Based on your current weather conditions, I recommend increasing irrigation for your tomato crops.",
          "Your soil moisture levels are optimal for planting. Consider adding nitrogen-rich fertilizer to field B.",
          "The humidity levels suggest potential fungal risk. Monitor your crops closely and consider preventive spraying.",
          "Your crop health indicators look excellent! Keep up the current care routine.",
          "I notice some sensors showing low battery. Please check and replace batteries for continuous monitoring."
        ];
        
        const aiResponse = {
          role: 'assistant',
          message: responses[Math.floor(Math.random() * responses.length)]
        };
        
        setChatHistory(prev => [...prev, aiResponse]);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Handle error - show fallback response
      const errorResponse = {
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again later.'
      };
      setChatHistory(prev => [...prev, errorResponse]);
    }
    
    setChatMessage('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysToHarvest = (harvestDate: string) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-green-500';
    if (health >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'seedling': return 'bg-green-100 text-green-800';
      case 'vegetative': return 'bg-blue-100 text-blue-800';
      case 'flowering': return 'bg-purple-100 text-purple-800';
      case 'fruiting': return 'bg-orange-100 text-orange-800';
      case 'mature': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Alert Messages */}
        {alertMessage && (
          <Alert className={`${alertMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alertMessage.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Header - Responsive */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Crops & IoT Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your crops, monitor IoT sensors, and get AI recommendations</p>
          </div>
          
          {/* Search Bar - Responsive */}
          <div className="w-full sm:max-w-md">
            <SearchBar 
              placeholder="Search crops, sensors, or ask AI..."
              value={searchQuery}
              onChange={setSearchQuery}
              size="md"
            />
          </div>
        </div>

        {/* Real-time Weather Recommendations for Crops */}
        {weatherData && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Current Weather Impact on Crops</span>
                {loadingWeather && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <p className="text-lg font-semibold">{weatherData.temperature}°C</p>
                  <p className="text-xs text-gray-600 capitalize">{weatherData.description}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Humidity</span>
                  </div>
                  <p className="text-lg font-semibold">{weatherData.humidity}%</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Wind Speed</span>
                  </div>
                  <p className="text-lg font-semibold">{weatherData.windSpeed} m/s</p>
                </div>
              </div>
              
              {/* Crop-specific recommendations */}
              {Object.keys(cropWeatherRecommendations).length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Recommendations for Your Crops:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredCrops.slice(0, 4).map((crop) => {
                      const recommendations = cropWeatherRecommendations[crop.id] || [];
                      const highPriorityRecs = recommendations.filter(rec => rec.severity === 'high').slice(0, 1);
                      const allRecs = highPriorityRecs.length > 0 ? highPriorityRecs : recommendations.slice(0, 1);
                      
                      return (
                        <div key={crop.id} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sprout className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm">{crop.name}</span>
                            <Badge className="text-xs">{crop.type}</Badge>
                          </div>
                          {allRecs.map((rec, index) => (
                            <div key={index} className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">{rec.category}</p>
                              <p className="text-xs text-gray-600">{rec.message}</p>
                              {rec.action && (
                                <p className="text-xs italic text-blue-600">Action: {rec.action}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="crops" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crops" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Sprout className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Crops Management</span>
              <span className="xs:hidden">Crops</span>
            </TabsTrigger>
            <TabsTrigger value="iot" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">IoT Sensors</span>
              <span className="xs:hidden">IoT</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">AI Recommendations</span>
              <span className="xs:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          {/* CROPS MANAGEMENT TAB */}
          <TabsContent value="crops" className="space-y-4 sm:space-y-6">
            {/* Crops Overview Stats - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <div>
                      <p className="text-lg sm:text-2xl font-bold">{filteredCrops.length}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Total Crops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <div>
                      <p className="text-lg sm:text-2xl font-bold">
                        {crops.length > 0 ? Math.round(crops.reduce((sum, crop) => sum + crop.health, 0) / crops.length) : 0}%
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">Avg Health</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    <div>
                      <p className="text-lg sm:text-2xl font-bold">
                        {crops.length > 0 ? Math.min(...crops.map(crop => getDaysToHarvest(crop.expectedHarvest))) : 0}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">Days to Next Harvest</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {crops.reduce((sum, crop) => sum + crop.area, 0).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Total Area (acres)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add New Crop Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Crop Overview</h2>
              <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Crop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Crop</DialogTitle>
                    <DialogDescription>Enter details for your new crop</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCrop} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cropName">Crop Name</Label>
                        <Input 
                          id="cropName" 
                          placeholder="e.g., Maize Field B" 
                          value={newCrop.name}
                          onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cropType">Crop Type</Label>
                        <Select value={newCrop.type} onValueChange={(value) => setNewCrop({...newCrop, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select crop type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maize">Maize</SelectItem>
                            <SelectItem value="tomatoes">Tomatoes</SelectItem>
                            <SelectItem value="cabbage">Cabbage</SelectItem>
                            <SelectItem value="beans">Beans</SelectItem>
                            <SelectItem value="potatoes">Potatoes</SelectItem>
                            <SelectItem value="carrots">Carrots</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="variety">Variety</Label>
                        <Input 
                          id="variety" 
                          placeholder="e.g., H614, Roma" 
                          value={newCrop.variety}
                          onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stage">Growth Stage</Label>
                        <Select value={newCrop.stage} onValueChange={(value) => setNewCrop({...newCrop, stage: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Seedling">Seedling</SelectItem>
                            <SelectItem value="Vegetative">Vegetative</SelectItem>
                            <SelectItem value="Flowering">Flowering</SelectItem>
                            <SelectItem value="Fruiting">Fruiting</SelectItem>
                            <SelectItem value="Mature">Mature</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="datePlanted">Date Planted</Label>
                        <Input 
                          id="datePlanted" 
                          type="date" 
                          value={newCrop.datePlanted}
                          onChange={(e) => setNewCrop({...newCrop, datePlanted: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedHarvest">Expected Harvest</Label>
                        <Input 
                          id="expectedHarvest" 
                          type="date" 
                          value={newCrop.expectedHarvest}
                          onChange={(e) => setNewCrop({...newCrop, expectedHarvest: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="area">Area (acres)</Label>
                        <Input 
                          id="area" 
                          type="number" 
                          step="0.1"
                          placeholder="2.5" 
                          value={newCrop.area}
                          onChange={(e) => setNewCrop({...newCrop, area: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          placeholder="e.g., North Field, Greenhouse 1" 
                          value={newCrop.location}
                          onChange={(e) => setNewCrop({...newCrop, location: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddCropOpen(false)} disabled={loading}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Crop'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Crops Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sprout className="w-5 h-5" />
                  <span>Active Crops</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Crop</th>
                        <th className="text-left py-3 px-2">Date Planted</th>
                        <th className="text-left py-3 px-2">Expected Harvest</th>
                        <th className="text-left py-3 px-2">Stage</th>
                        <th className="text-left py-3 px-2">Health</th>
                        <th className="text-left py-3 px-2">Progress</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCrops.map((crop) => (
                        <tr key={crop.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-2">
                            <div>
                              <p className="font-medium">{crop.name}</p>
                              <p className="text-sm text-gray-600">{crop.type} - {crop.variety}</p>
                              <p className="text-xs text-gray-500">{crop.location} • {crop.area} acres</p>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{formatDate(crop.datePlanted)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Target className="w-3 h-3 text-gray-400" />
                              <span>{formatDate(crop.expectedHarvest)}</span>
                              <Badge className="ml-2 text-xs">
                                {getDaysToHarvest(crop.expectedHarvest)} days
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge className={getStageColor(crop.stage)}>{crop.stage}</Badge>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{crop.health}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getHealthColor(crop.health)}`}
                                  style={{ width: `${crop.health}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{crop.progress}%</span>
                              <Progress value={crop.progress} className="w-20 h-2" />
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" title="View Details">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" title="Edit Crop">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDeleteCrop(crop.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete Crop"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredCrops.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-500">
                      No crops found matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                  
                  {filteredCrops.length === 0 && !searchQuery && (
                    <div className="text-center py-12 text-gray-500">
                      <Sprout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No crops added yet</p>
                      <p className="text-sm">Get started by adding your first crop!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IOT SENSORS TAB */}
          <TabsContent value="iot" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">IoT Sensor Network</h2>
              <Dialog open={isAddSensorOpen} onOpenChange={setIsAddSensorOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sensor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New IoT Sensor</DialogTitle>
                    <DialogDescription>Configure a new sensor for your farm</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSensor} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sensorName">Sensor Name</Label>
                      <Input 
                        id="sensorName" 
                        placeholder="e.g., Field A Soil Monitor" 
                        value={newSensor.name}
                        onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sensorType">Sensor Type</Label>
                      <Select value={newSensor.type} onValueChange={(value) => setNewSensor({...newSensor, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sensor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soil Moisture">Soil Moisture</SelectItem>
                          <SelectItem value="Temperature">Temperature</SelectItem>
                          <SelectItem value="Humidity">Humidity</SelectItem>
                          <SelectItem value="pH Level">pH Level</SelectItem>
                          <SelectItem value="Light">Light Intensity</SelectItem>
                          <SelectItem value="Nutrients">Nutrient Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sensorLocation">Location</Label>
                      <Input 
                        id="sensorLocation" 
                        placeholder="e.g., North Field, Section B" 
                        value={newSensor.location}
                        onChange={(e) => setNewSensor({...newSensor, location: e.target.value})}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddSensorOpen(false)} disabled={loading}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Sensor'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* IoT Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{filteredSensors.length}</p>
                      <p className="text-sm text-gray-600">Total Sensors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {sensors.filter(s => s.status === 'active').length}
                      </p>
                      <p className="text-sm text-gray-600">Active Sensors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Battery className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {sensors.length > 0 ? Math.round(sensors.reduce((sum, s) => sum + s.batteryLevel, 0) / sensors.length) : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Battery</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {sensors.filter(s => s.batteryLevel < 20).length}
                      </p>
                      <p className="text-sm text-gray-600">Low Battery</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sensors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSensors.map((sensor) => (
                <Card key={sensor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sensor.name}</CardTitle>
                      <Badge className={sensor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {sensor.status === 'active' ? 'Active' : sensor.status === 'inactive' ? 'Inactive' : 'Maintenance'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{sensor.type}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Current Reading:</span>
                      <span className="font-medium">{sensor.lastReading.value}{sensor.lastReading.unit}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="text-sm">{sensor.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Battery:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${sensor.batteryLevel > 50 ? 'bg-green-500' : sensor.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${sensor.batteryLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{sensor.batteryLevel}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Last Reading:</span>
                      <span className="text-sm">{new Date(sensor.lastReading.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" title="Configure Sensor">
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          <Button size="sm" variant="outline" title="View Data">
                            <Eye className="w-3 h-3 mr-1" />
                            View Data
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteSensor(sensor.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Sensor"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredSensors.length === 0 && searchQuery && (
              <div className="text-center py-8 text-gray-500">
                No sensors found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
            
            {filteredSensors.length === 0 && !searchQuery && (
              <div className="text-center py-12 text-gray-500">
                <Wifi className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No sensors configured yet</p>
                <p className="text-sm">Add your first IoT sensor to start monitoring!</p>
              </div>
            )}
          </TabsContent>

          {/* AI RECOMMENDATIONS TAB */}
          <TabsContent value="ai" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI Farming Assistant</h2>
              <Button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Bot className="w-4 h-4 mr-2" />
                {isChatOpen ? 'Close Chat' : 'Open Chat'}
              </Button>
            </div>

            {/* AI Recommendations Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <span>Irrigation Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Maize Field A</p>
                    <p className="text-sm text-blue-700">Increase watering by 20%. Soil moisture is below optimal levels.</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">High Priority</Badge>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Tomato Greenhouse</p>
                    <p className="text-sm text-green-700">Current irrigation schedule is optimal. Continue current routine.</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Good</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span>Health Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Cabbage Field B</p>
                    <p className="text-sm text-yellow-700">Potential pest activity detected. Consider organic pesticide treatment.</p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Bean Field C</p>
                    <p className="text-sm text-green-700">Excellent growth rate. Ready for harvest in 5-7 days.</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Ready</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                    <span>Weather Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">Heavy Rain Alert</p>
                    <p className="text-sm text-orange-700">Heavy rainfall expected tomorrow. Ensure proper drainage in all fields.</p>
                    <Badge className="mt-2 bg-orange-100 text-orange-800">Weather Alert</Badge>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Temperature Drop</p>
                    <p className="text-sm text-blue-700">Night temperatures will drop to 12°C. Protect sensitive crops.</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Advisory</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span>Harvest Planning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Optimal Harvest Window</p>
                    <p className="text-sm text-purple-700">Tomatoes in Greenhouse 1 will reach peak ripeness in 3-4 days.</p>
                    <Badge className="mt-2 bg-purple-100 text-purple-800">Upcoming</Badge>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Market Timing</p>
                    <p className="text-sm text-green-700">Current market prices for beans are 15% above average. Consider harvesting early.</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Opportunity</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Chat Interface */}
            {isChatOpen && (
              <Card className="border-2 border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <span>AI Farming Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-lg ${
                          msg.role === 'user' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask about your crops, weather, or farming advice..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendChatMessage} className="bg-purple-600 hover:bg-purple-700">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}