'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Sprout, 
  Wifi, 
  Bot, 
  Thermometer,
  Droplets,
  Activity,
  Battery,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Calendar,
  Target,
  TrendingUp,
  Settings,
  Zap
} from 'lucide-react';
import { dummyCrops, dummyIoTSensors } from '@/lib/dummy-data';
import { Crop, IoTSensor } from '@/types';

export default function CropsPage() {
  const [crops] = useState<Crop[]>(dummyCrops);
  const [sensors] = useState<IoTSensor[]>(dummyIoTSensors);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', message: 'Hello! I\'m your AI farming assistant. How can I help you optimize your crops today?' }
  ]);
  const [newCrop, setNewCrop] = useState({
    name: '',
    type: '',
    variety: '',
    datePlanted: '',
    area: '',
    location: ''
  });

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to database
    console.log('Adding new crop:', newCrop);
    setIsAddCropOpen(false);
    setNewCrop({
      name: '',
      type: '',
      variety: '',
      datePlanted: '',
      area: '',
      location: ''
    });
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newHistory = [
      ...chatHistory,
      { role: 'user', message: chatMessage },
      { 
        role: 'assistant', 
        message: getAIResponse(chatMessage)
      }
    ];
    
    setChatHistory(newHistory);
    setChatMessage('');
  };

  const getAIResponse = (message: string) => {
    const responses = [
      'Based on your current crops, I recommend monitoring soil moisture levels more closely for your maize field. Consider adjusting irrigation schedule based on weather forecasts.',
      'Your tomato greenhouse shows excellent health! To maintain this, ensure consistent temperature between 18-24°C and humidity around 60-70%.',
      'I notice your cabbage crop health is at 78%. This could be improved by applying organic compost and ensuring proper spacing between plants.',
      'Weather patterns suggest increased rainfall next week. Consider reducing irrigation and improving drainage to prevent waterlogging.',
      'Your IoT sensors indicate optimal growing conditions. Continue current care routine and monitor for any pest activity.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getStatusColor = (status: IoTSensor['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'maintenance': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: IoTSensor['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
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
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crops & IoT Management</h1>
          <p className="text-gray-600 mt-1">Manage your crops and monitor IoT sensors</p>
        </div>

        <Tabs defaultValue="crops" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crops">Crops Management</TabsTrigger>
            <TabsTrigger value="iot">IoT Sensors</TabsTrigger>
            <TabsTrigger value="ai">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="crops" className="space-y-6">
            {/* Crops Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{crops.length}</p>
                      <p className="text-sm text-gray-600">Total Crops</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(crops.reduce((sum, crop) => sum + crop.health, 0) / crops.length)}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Health</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.min(...crops.map(crop => getDaysToHarvest(crop.expectedHarvest)))}
                      </p>
                      <p className="text-sm text-gray-600">Days to Next Harvest</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Crop</DialogTitle>
                    <DialogDescription>Enter details for your new crop</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCrop} className="space-y-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="variety">Variety</Label>
                      <Input 
                        id="variety" 
                        placeholder="e.g., H614, Roma" 
                        value={newCrop.variety}
                        onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                      />
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
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddCropOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Add Crop
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
                      {crops.map((crop) => (
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
                              <Badge variant="outline" className="ml-2 text-xs">
                                {getDaysToHarvest(crop.expectedHarvest)} days
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="outline">{crop.stage}</Badge>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{crop.health}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${crop.health >= 80 ? 'bg-green-500' : crop.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
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
                              <Button size="sm" variant="outline">
                                <Settings className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iot" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">IoT Sensor Network</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Sensor
              </Button>
            </div>

            {/* IoT Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{sensors.length}</p>
                      <p className="text-sm text-gray-600">Total Sensors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {sensors.filter(s => s.status === 'active').length}
                      </p>
                      <p className="text-sm text-gray-600">Active</p>
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
                        {sensors.filter(s => s.status === 'maintenance').length}
                      </p>
                      <p className="text-sm text-gray-600">Maintenance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Battery className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(sensors.reduce((sum, sensor) => sum + sensor.batteryLevel, 0) / sensors.length)}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Battery</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sensors.map((sensor) => (
                <Card key={sensor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Wifi className="w-5 h-5 text-blue-600" />
                        <span>{sensor.name}</span>
                      </CardTitle>
                      <Badge className={getStatusColor(sensor.status)}>
                        {getStatusIcon(sensor.status)}
                        <span className="ml-1 capitalize">{sensor.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{sensor.type} • {sensor.location}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Last Reading</span>
                        <span className="text-xs text-gray-500">
                          {new Date(sensor.lastReading.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {sensor.type === 'Temperature' ? (
                          <Thermometer className="w-4 h-4 text-red-500" />
                        ) : sensor.type === 'Soil Moisture' ? (
                          <Droplets className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Activity className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-lg font-semibold">
                          {sensor.lastReading.value} {sensor.lastReading.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Battery className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Battery</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${sensor.batteryLevel > 50 ? 'bg-green-500' : sensor.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${sensor.batteryLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{sensor.batteryLevel}%</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2 border-t">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Zap className="w-3 h-3 mr-1" />
                        Calibrate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI Farming Assistant</h2>
              <Button onClick={() => setIsChatOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Chat
              </Button>
            </div>

            {/* AI Recommendations Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-gray-600">AI Recommendations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-gray-600">Implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <span>Recent AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
                    <h4 className="font-medium text-blue-900">Irrigation Optimization</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Based on weather data and soil moisture readings, reduce watering for Maize Field A by 15% to prevent waterlogging.
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-blue-600">2 hours ago</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Implement
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50">
                    <h4 className="font-medium text-green-900">Nutrient Management</h4>
                    <p className="text-sm text-green-800 mt-1">
                      Tomato Greenhouse 1 shows signs of nitrogen deficiency. Consider applying balanced fertilizer within the next 3 days.
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-green-600">5 hours ago</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Implement
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4 py-3 bg-yellow-50">
                    <h4 className="font-medium text-yellow-900">Pest Alert</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Weather conditions favor aphid development. Monitor cabbage crops closely and prepare preventive treatments.
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-yellow-600">1 day ago</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Implement
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50">
                    <h4 className="font-medium text-purple-900">Harvest Planning</h4>
                    <p className="text-sm text-purple-800 mt-1">
                      Your tomatoes will be ready for harvest in 23 days. Start preparing storage facilities and consider market timing.
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-purple-600">1 day ago</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Implement
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Modal */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span>AI Farming Assistant</span>
                  </DialogTitle>
                  <DialogDescription>
                    Ask questions about your crops, get personalized recommendations
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg h-96">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        chat.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-800 border'
                      }`}>
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2 pt-4 border-t">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about your crops..."
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage} disabled={!chatMessage.trim()}>
                    Send
                  </Button>
                </div>
                
                {/* Quick Questions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setChatMessage("How can I improve my crop health?")}
                    className="text-xs"
                  >
                    Improve crop health
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setChatMessage("When should I harvest my tomatoes?")}
                    className="text-xs"
                  >
                    Harvest timing
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setChatMessage("What fertilizer should I use?")}
                    className="text-xs"
                  >
                    Fertilizer advice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}