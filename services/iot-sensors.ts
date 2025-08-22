import { localStorageService } from './local-storage';

export interface IoTSensor {
  id: string;
  name: string;
  type: string;
  location: string;
  batteryLevel: number;
  status: 'active' | 'inactive' | 'maintenance';
  lastReading: {
    timestamp: string;
    value: number;
    unit: string;
  };
}

export const iotSensorsAPI = {
  getAllSensors: (): IoTSensor[] => {
    const sensorsJSON = localStorage.getItem('iot_sensors');
    return sensorsJSON ? JSON.parse(sensorsJSON) : [];
  },

  addSensor: (sensor: Omit<IoTSensor, 'id' | 'batteryLevel' | 'status' | 'lastReading'>): IoTSensor => {
    const sensors = iotSensorsAPI.getAllSensors();
    const newSensor: IoTSensor = {
      id: Math.random().toString(36).substr(2, 9),
      ...sensor,
      batteryLevel: Math.floor(Math.random() * (100 - 85) + 85), // Random battery level between 85-100
      status: 'active',
      lastReading: {
        timestamp: new Date().toISOString(),
        value: Math.floor(Math.random() * 100),
        unit: sensor.type === 'Temperature' ? '°C' : 
              sensor.type === 'Humidity' ? '%' : 
              sensor.type === 'Soil Moisture' ? '%' :
              sensor.type === 'pH' ? 'pH' : 'units'
      }
    };
    
    sensors.push(newSensor);
    localStorage.setItem('iot_sensors', JSON.stringify(sensors));
    return newSensor;
  },

  updateSensor: (id: string, updates: Partial<IoTSensor>): IoTSensor | null => {
    const sensors = iotSensorsAPI.getAllSensors();
    const index = sensors.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    sensors[index] = { ...sensors[index], ...updates };
    localStorage.setItem('iot_sensors', JSON.stringify(sensors));
    return sensors[index];
  },

  deleteSensor: (id: string): boolean => {
    const sensors = iotSensorsAPI.getAllSensors();
    const filtered = sensors.filter(s => s.id !== id);
    if (filtered.length === sensors.length) return false;
    
    localStorage.setItem('iot_sensors', JSON.stringify(filtered));
    return true;
  },

  simulateReading: (sensor: IoTSensor): IoTSensor => {
    const newValue = () => {
      switch (sensor.type) {
        case 'Temperature':
          return Math.random() * (35 - 20) + 20; // 20-35°C
        case 'Humidity':
          return Math.random() * (90 - 40) + 40; // 40-90%
        case 'Soil Moisture':
          return Math.random() * (100 - 20) + 20; // 20-100%
        case 'pH':
          return Math.random() * (8 - 5) + 5; // pH 5-8
        default:
          return Math.random() * 100;
      }
    };

    return {
      ...sensor,
      batteryLevel: Math.max(sensor.batteryLevel - Math.random(), 0),
      lastReading: {
        timestamp: new Date().toISOString(),
        value: newValue(),
        unit: sensor.type === 'Temperature' ? '°C' : 
              sensor.type === 'Humidity' ? '%' : 
              sensor.type === 'Soil Moisture' ? '%' :
              sensor.type === 'pH' ? 'pH' : 'units'
      }
    };
  }
};
