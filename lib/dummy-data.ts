import { User, Weather, WeatherForecast, Crop, Advisory, CommunityPost, IoTSensor, WeatherHistoricalData } from '@/types';

export const dummyUsers: User[] = [
  { id: '1', name: 'John Farmer', email: 'john@example.com', location: 'Nairobi, Kenya' },
  { id: '2', name: 'Mary Grower', email: 'mary@example.com', location: 'Mombasa, Kenya' },
];

export const currentWeather: Weather = {
  temperature: 24,
  humidity: 68,
  rainfall: 2.5,
  condition: 'Partly Cloudy',
  icon: '⛅'
};

export const tomorrowForecast: WeatherForecast = {
  date: '2025-01-08',
  temperature: 26,
  humidity: 72,
  rainfall: 1.2,
  condition: 'Sunny',
  icon: '☀️'
};

export const dummyCrops: Crop[] = [
  {
    id: '1',
    name: 'Maize Field A',
    type: 'Maize',
    datePlanted: '2024-10-15',
    expectedHarvest: '2025-02-15',
    stage: 'Flowering',
    health: 85,
    progress: 65,
    location: 'North Field',
    variety: 'H614',
    area: 2.5
  },
  {
    id: '2',
    name: 'Tomato Greenhouse 1',
    type: 'Tomatoes',
    datePlanted: '2024-11-01',
    expectedHarvest: '2025-01-30',
    stage: 'Fruiting',
    health: 92,
    progress: 80,
    location: 'Greenhouse 1',
    variety: 'Roma',
    area: 0.8
  },
  {
    id: '3',
    name: 'Cabbage Plot B',
    type: 'Cabbage',
    datePlanted: '2024-11-20',
    expectedHarvest: '2025-02-20',
    stage: 'Head Formation',
    health: 78,
    progress: 45,
    location: 'South Field',
    variety: 'Copenhagen Market',
    area: 1.2
  }
];

export const dummyAdvisories: Advisory[] = [
  {
    id: '1',
    title: 'Pest Management for Maize',
    content: 'Monitor your maize crops for fall armyworm. Apply appropriate pesticides if needed.',
    category: 'Pest Control',
    date: '2025-01-07',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Irrigation Scheduling',
    content: 'With the current weather conditions, reduce irrigation frequency to prevent waterlogging.',
    category: 'Water Management',
    date: '2025-01-06',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Soil Health Improvement',
    content: 'Consider adding organic compost to improve soil structure and nutrient content.',
    category: 'Soil Management',
    date: '2025-01-05',
    priority: 'low'
  }
];

export const dummyCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    author: 'John Farmer',
    content: 'Has anyone tried the new drought-resistant maize variety? Looking for feedback on yields and pest resistance. I\'m considering switching from my current variety but want to make sure it\'s worth the investment.',
    date: '2025-01-07T10:30:00Z',
    likes: 15,
    tags: ['maize', 'varieties', 'drought-resistance'],
    replies: [
      {
        id: '1',
        author: 'Mary Grower',
        content: 'I tried it last season. Great drought tolerance but requires more fertilizer. Yields were about 10% higher than my previous variety. The seed cost is higher but worth it in dry areas.',
        date: '2025-01-07T14:20:00Z',
        likes: 8
      },
      {
        id: '2',
        author: 'Samuel Kiprotich',
        content: 'I agree with Mary. Been growing it for 2 seasons now. The pest resistance is excellent - barely needed any pesticides. Perfect for our climate in Nakuru.',
        date: '2025-01-07T16:45:00Z',
        likes: 5
      }
    ]
  },
  {
    id: '2',
    author: 'Peter Agri',
    content: 'Sharing my experience with drip irrigation. Cut water usage by 40% and increased tomato yields by 25%. Happy to answer questions! Initial setup cost was high but pays for itself in 2 seasons.',
    date: '2025-01-06T08:15:00Z',
    likes: 23,
    tags: ['irrigation', 'tomatoes', 'water-conservation'],
    replies: [
      {
        id: '3',
        author: 'Grace Wanjiku',
        content: 'What brand of drip irrigation system did you use? I\'m looking to set up something similar for my greenhouse.',
        date: '2025-01-06T10:30:00Z',
        likes: 3
      },
      {
        id: '4',
        author: 'Peter Agri',
        content: 'I used a local brand - Aquaflow. Good quality and affordable. They also provide installation support. Contact me if you need their details.',
        date: '2025-01-06T11:45:00Z',
        likes: 7
      }
    ]
  },
  {
    id: '3',
    author: 'Dr. Jane Muteti',
    content: 'PSA: Fall armyworm season is approaching. Start scouting your maize fields now. Early detection is key. Look for feeding damage on leaves and frass (droppings) in the whorl.',
    date: '2025-01-05T15:20:00Z',
    likes: 31,
    tags: ['pest-control', 'maize', 'fall-armyworm'],
    replies: [
      {
        id: '5',
        author: 'Joseph Kimani',
        content: 'Thank you Dr. Muteti! What\'s the best organic treatment for early stages? I prefer to avoid chemicals if possible.',
        date: '2025-01-05T16:10:00Z',
        likes: 4
      },
      {
        id: '6',
        author: 'Dr. Jane Muteti',
        content: 'Neem oil spray works well in early stages. Also consider beneficial insects like Trichogramma. For severe infestations, targeted chemical treatment may be necessary.',
        date: '2025-01-05T17:30:00Z',
        likes: 12
      }
    ]
  },
  {
    id: '4',
    author: 'Mike Ochieng',
    content: 'Soil testing results came back - pH is too high (8.2) for optimal crop growth. What\'s the best way to lower soil pH naturally? I have about 3 hectares to treat.',
    date: '2025-01-04T12:45:00Z',
    likes: 18,
    tags: ['soil-management', 'ph', 'fertilizers'],
    replies: [
      {
        id: '7',
        author: 'Agricultural Extension Officer',
        content: 'Sulfur application is most effective for lowering pH. Apply agricultural sulfur at 200-300kg per hectare. Organic matter like compost also helps over time.',
        date: '2025-01-04T14:20:00Z',
        likes: 9
      },
      {
        id: '8',
        author: 'Sarah Njeri',
        content: 'I had similar issue. Added pine needles and coffee grounds as mulch. Took 2 seasons but pH dropped from 8.0 to 7.2. Cheaper than sulfur.',
        date: '2025-01-04T15:15:00Z',
        likes: 6
      }
    ]
  },
  {
    id: '5',
    author: 'Rose Akinyi',
    content: 'Weather forecast shows heavy rains next week. Should I harvest my beans early or wait? They\'re about 80% mature. Worried about waterlogging.',
    date: '2025-01-03T09:30:00Z',
    likes: 12,
    tags: ['weather', 'beans', 'harvest'],
    replies: [
      {
        id: '9',
        author: 'David Mwangi',
        content: 'I\'d harvest now if they\'re 80% mature. Better safe than sorry. You can dry them indoors if needed.',
        date: '2025-01-03T10:15:00Z',
        likes: 5
      }
    ]
  },
  {
    id: '6',
    author: 'Francis Korir',
    content: 'Looking to form a farmer cooperative in Eldoret area. We can bulk purchase fertilizers and seeds for better prices. Also share equipment. Who\'s interested?',
    date: '2025-01-02T14:00:00Z',
    likes: 28,
    tags: ['cooperative', 'fertilizers', 'community'],
    replies: [
      {
        id: '10',
        author: 'Betty Cheptoo',
        content: 'Very interested! I have 5 hectares in Kapsabet. Been looking for something like this. When can we meet?',
        date: '2025-01-02T15:30:00Z',
        likes: 4
      },
      {
        id: '11',
        author: 'Francis Korir',
        content: 'Great Betty! I\'ll create a WhatsApp group. Others can DM me their contacts. Planning first meeting next Saturday.',
        date: '2025-01-02T16:45:00Z',
        likes: 7
      }
    ]
  },
  {
    id: '7',
    author: 'Agnes Wambui',
    content: 'My greenhouse tomatoes are developing blossom end rot. I know it\'s calcium deficiency but my soil test shows adequate calcium levels. What could be the issue?',
    date: '2025-01-01T11:20:00Z',
    likes: 16,
    tags: ['tomatoes', 'plant-diseases', 'greenhouse'],
    replies: [
      {
        id: '12',
        author: 'Dr. Plant Pathologist',
        content: 'It\'s usually not soil calcium but availability. Check irrigation consistency. Uneven watering prevents calcium uptake. Also check soil pH - should be 6.0-6.8.',
        date: '2025-01-01T13:45:00Z',
        likes: 11
      }
    ]
  }
];

export const dummyIoTSensors: IoTSensor[] = [
  {
    id: '1',
    name: 'Soil Moisture Sensor 1',
    type: 'Soil Moisture',
    status: 'active',
    location: 'North Field',
    lastReading: {
      timestamp: '2025-01-07T10:30:00Z',
      value: 65,
      unit: '%'
    },
    batteryLevel: 87
  },
  {
    id: '2',
    name: 'Temperature Sensor 1',
    type: 'Temperature',
    status: 'active',
    location: 'Greenhouse 1',
    lastReading: {
      timestamp: '2025-01-07T10:25:00Z',
      value: 24.5,
      unit: '°C'
    },
    batteryLevel: 92
  },
  {
    id: '3',
    name: 'pH Sensor 1',
    type: 'Soil pH',
    status: 'maintenance',
    location: 'South Field',
    lastReading: {
      timestamp: '2025-01-06T15:20:00Z',
      value: 6.8,
      unit: 'pH'
    },
    batteryLevel: 34
  }
];

export const historicalWeatherData: WeatherHistoricalData[] = [
  { date: '2025-01-01', temperature: 22, humidity: 70, rainfall: 0 },
  { date: '2025-01-02', temperature: 25, humidity: 65, rainfall: 1.2 },
  { date: '2025-01-03', temperature: 23, humidity: 72, rainfall: 3.8 },
  { date: '2025-01-04', temperature: 26, humidity: 60, rainfall: 0 },
  { date: '2025-01-05', temperature: 24, humidity: 68, rainfall: 0.5 },
  { date: '2025-01-06', temperature: 27, humidity: 58, rainfall: 0 },
  { date: '2025-01-07', temperature: 24, humidity: 68, rainfall: 2.5 },
];