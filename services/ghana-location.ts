// Ghana-specific location service for GPS, Google Maps, and farming regions
export interface GhanaFarmLocation {
  id: string;
  name: string;
  region: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  farmType: string;
  cropTypes: string[];
  soilType: string;
  areaSize: number; // in hectares
  waterSource: string[];
  accessibility: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface GhanaRegionInfo {
  name: string;
  capital: string;
  districts: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  climate: string;
  mainCrops: string[];
  soilTypes: string[];
  farmingSeasons: {
    major: string;
    minor: string;
  };
}

class GhanaLocationService {
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private userLocation: { lat: number; lng: number } | null = null;

  // Ghana's 16 regions with their agricultural information
  private readonly ghanaRegions: GhanaRegionInfo[] = [
    {
      name: 'Greater Accra',
      capital: 'Accra',
      districts: ['Accra Metropolitan', 'Tema Metropolitan', 'Ga East Municipal', 'Ga West Municipal'],
      coordinates: { lat: 5.6037, lng: -0.1870 },
      climate: 'Dry equatorial',
      mainCrops: ['cassava', 'maize', 'sweet potato', 'okra', 'tomato'],
      soilTypes: ['Sandy', 'Clay', 'Loamy'],
      farmingSeasons: { major: 'April-July', minor: 'September-December' }
    },
    {
      name: 'Ashanti',
      capital: 'Kumasi',
      districts: ['Kumasi Metropolitan', 'Obuasi Municipal', 'Ejisu Municipal'],
      coordinates: { lat: 6.6885, lng: -1.6244 },
      climate: 'Wet semi-equatorial',
      mainCrops: ['cocoa', 'plantain', 'cassava', 'yam', 'maize'],
      soilTypes: ['Forest ochrosols', 'Oxysols'],
      farmingSeasons: { major: 'March-July', minor: 'September-November' }
    },
    {
      name: 'Northern',
      capital: 'Tamale',
      districts: ['Tamale Metropolitan', 'Yendi Municipal', 'Savelugu Municipal'],
      coordinates: { lat: 9.4034, lng: -0.8424 },
      climate: 'Guinea savanna',
      mainCrops: ['millet', 'sorghum', 'maize', 'rice', 'yam', 'groundnut'],
      soilTypes: ['Savanna ochrosols', 'Groundwater laterite'],
      farmingSeasons: { major: 'May-September', minor: 'October-February' }
    },
    {
      name: 'Upper East',
      capital: 'Bolgatanga',
      districts: ['Bolgatanga Municipal', 'Bawku Municipal', 'Navrongo Municipal'],
      coordinates: { lat: 10.7850, lng: -0.8513 },
      climate: 'Sudan savanna',
      mainCrops: ['millet', 'sorghum', 'rice', 'groundnut', 'cowpea'],
      soilTypes: ['Savanna ochrosols', 'Lithosols'],
      farmingSeasons: { major: 'May-September', minor: 'October-January' }
    },
    {
      name: 'Upper West',
      capital: 'Wa',
      districts: ['Wa Municipal', 'Lawra Municipal', 'Jirapa Municipal'],
      coordinates: { lat: 10.0601, lng: -2.5057 },
      climate: 'Sudan savanna',
      mainCrops: ['millet', 'sorghum', 'rice', 'groundnut', 'cowpea'],
      soilTypes: ['Savanna ochrosols', 'Lithosols'],
      farmingSeasons: { major: 'May-September', minor: 'October-January' }
    },
    {
      name: 'Volta',
      capital: 'Ho',
      districts: ['Ho Municipal', 'Hohoe Municipal', 'Keta Municipal'],
      coordinates: { lat: 6.6108, lng: 0.4708 },
      climate: 'Wet semi-equatorial',
      mainCrops: ['maize', 'cassava', 'yam', 'rice', 'cocoa'],
      soilTypes: ['Voltaian sandstone', 'Tropical black earth'],
      farmingSeasons: { major: 'April-July', minor: 'September-November' }
    },
    {
      name: 'Eastern',
      capital: 'Koforidua',
      districts: ['New Juaben Municipal', 'Akuapem North Municipal', 'Yilo Krobo Municipal'],
      coordinates: { lat: 6.0840, lng: -0.2605 },
      climate: 'Wet semi-equatorial',
      mainCrops: ['cocoa', 'oil palm', 'cassava', 'plantain', 'maize'],
      soilTypes: ['Forest ochrosols', 'Oxysols'],
      farmingSeasons: { major: 'March-July', minor: 'September-November' }
    },
    {
      name: 'Western',
      capital: 'Sekondi-Takoradi',
      districts: ['Sekondi-Takoradi Metropolitan', 'Tarkwa-Nsuaem Municipal'],
      coordinates: { lat: 4.8960, lng: -1.7525 },
      climate: 'Wet equatorial',
      mainCrops: ['cocoa', 'oil palm', 'rubber', 'cassava', 'plantain'],
      soilTypes: ['Forest oxysols', 'Sandy loam'],
      farmingSeasons: { major: 'March-July', minor: 'September-December' }
    },
    {
      name: 'Central',
      capital: 'Cape Coast',
      districts: ['Cape Coast Metropolitan', 'Kasoa Municipal', 'Awutu Senya East Municipal'],
      coordinates: { lat: 5.1053, lng: -1.2466 },
      climate: 'Wet semi-equatorial',
      mainCrops: ['cassava', 'maize', 'plantain', 'oil palm', 'cocoa'],
      soilTypes: ['Coastal savanna', 'Sandy loam'],
      farmingSeasons: { major: 'April-July', minor: 'September-November' }
    },
    {
      name: 'Brong-Ahafo',
      capital: 'Sunyani',
      districts: ['Sunyani Municipal', 'Techiman Municipal', 'Berekum Municipal'],
      coordinates: { lat: 7.3392, lng: -2.3294 },
      climate: 'Wet semi-equatorial',
      mainCrops: ['yam', 'maize', 'cassava', 'cocoa', 'cashew'],
      soilTypes: ['Forest ochrosols', 'Savanna ochrosols'],
      farmingSeasons: { major: 'April-July', minor: 'September-November' }
    }
  ];

  // Initialize Google Maps
  async initializeMap(containerId: string, center?: { lat: number; lng: number }): Promise<google.maps.Map | null> {
    try {
      const { Loader } = await import('@googlemaps/js-api-loader');
      
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      const google = await loader.load();
      
      const mapContainer = document.getElementById(containerId);
      if (!mapContainer) {
        console.error('Map container not found');
        return null;
      }

      // Default to Accra, Ghana if no center provided
      const defaultCenter = center || { lat: 5.6037, lng: -0.1870 };
      
      this.map = new google.maps.Map(mapContainer, {
        center: defaultCenter,
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.HYBRID, // Better for farming areas
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      // Add Ghana border outline
      this.addGhanaBorder();
      
      // Add region markers
      this.addRegionMarkers();

      return this.map;
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      return null;
    }
  }

  // Get user's current GPS location
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Verify if location is within Ghana bounds
          if (this.isLocationInGhana(location.lat, location.lng)) {
            this.userLocation = location;
            resolve(location);
          } else {
            console.warn('Current location is outside Ghana');
            // Return Accra as default
            resolve({ lat: 5.6037, lng: -0.1870 });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Return Accra as default
          resolve({ lat: 5.6037, lng: -0.1870 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Check if coordinates are within Ghana
  private isLocationInGhana(lat: number, lng: number): boolean {
    // Ghana's approximate bounds
    const ghanaBounds = {
      north: 11.2,
      south: 4.5,
      east: 1.3,
      west: -3.3
    };

    return lat >= ghanaBounds.south && lat <= ghanaBounds.north &&
           lng >= ghanaBounds.west && lng <= ghanaBounds.east;
  }

  // Add Ghana border to map
  private addGhanaBorder(): void {
    if (!this.map) return;

    // Simplified Ghana border coordinates
    const ghanaBorder = [
      { lat: 11.2, lng: -0.1 }, // Northern border
      { lat: 11.0, lng: 0.3 },
      { lat: 10.9, lng: 1.0 },
      { lat: 6.2, lng: 1.2 }, // Eastern border
      { lat: 5.0, lng: 1.1 },
      { lat: 4.7, lng: -0.2 },
      { lat: 4.5, lng: -1.2 }, // Southern border
      { lat: 4.8, lng: -2.8 },
      { lat: 5.2, lng: -3.2 },
      { lat: 9.4, lng: -3.3 }, // Western border
      { lat: 11.0, lng: -2.8 },
      { lat: 11.2, lng: -0.1 } // Back to start
    ];

    new google.maps.Polygon({
      paths: ghanaBorder,
      strokeColor: '#228B22',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#90EE90',
      fillOpacity: 0.1,
      map: this.map
    });
  }

  // Add region markers to map
  private addRegionMarkers(): void {
    if (!this.map) return;

    this.ghanaRegions.forEach((region) => {
      const marker = new google.maps.Marker({
        position: region.coordinates,
        map: this.map,
        title: `${region.name} Region - ${region.capital}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#228B22"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: this.createRegionInfoContent(region)
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
    });
  }

  // Create info window content for regions
  private createRegionInfoContent(region: GhanaRegionInfo): string {
    return `
      <div style="max-width: 300px; font-family: Arial, sans-serif;">
        <h3 style="color: #228B22; margin: 0 0 10px 0;">${region.name} Region</h3>
        <p><strong>Capital:</strong> ${region.capital}</p>
        <p><strong>Climate:</strong> ${region.climate}</p>
        <p><strong>Main Crops:</strong> ${region.mainCrops.join(', ')}</p>
        <p><strong>Soil Types:</strong> ${region.soilTypes.join(', ')}</p>
        <p><strong>Major Season:</strong> ${region.farmingSeasons.major}</p>
        <p><strong>Minor Season:</strong> ${region.farmingSeasons.minor}</p>
      </div>
    `;
  }

  // Add farm location marker
  addFarmMarker(farm: GhanaFarmLocation): google.maps.Marker | null {
    if (!this.map) return null;

    const marker = new google.maps.Marker({
      position: farm.coordinates,
      map: this.map,
      title: farm.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2C10.04 2 6 6.04 6 11c0 7.5 9 17 9 17s9-9.5 9-17c0-4.96-4.04-9-9-9z" fill="#8B4513"/>
            <circle cx="15" cy="11" r="4" fill="#FFA500"/>
            <text x="15" y="15" text-anchor="middle" fill="white" font-size="8">🚜</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(30, 30)
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: this.createFarmInfoContent(farm)
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });

    this.markers.push(marker);
    return marker;
  }

  // Create farm info window content
  private createFarmInfoContent(farm: GhanaFarmLocation): string {
    return `
      <div style="max-width: 320px; font-family: Arial, sans-serif;">
        <h3 style="color: #8B4513; margin: 0 0 10px 0;">🚜 ${farm.name}</h3>
        <p><strong>📍 Location:</strong> ${farm.district}, ${farm.region}</p>
        <p><strong>🌾 Farm Type:</strong> ${farm.farmType}</p>
        <p><strong>🌱 Crops:</strong> ${farm.cropTypes.join(', ')}</p>
        <p><strong>🏔️ Soil Type:</strong> ${farm.soilType}</p>
        <p><strong>📏 Area:</strong> ${farm.areaSize} hectares</p>
        <p><strong>💧 Water Source:</strong> ${farm.waterSource.join(', ')}</p>
        <p><strong>🛣️ Accessibility:</strong> ${farm.accessibility}</p>
        <p><strong>📌 Coordinates:</strong> ${farm.coordinates.lat.toFixed(4)}, ${farm.coordinates.lng.toFixed(4)}</p>
      </div>
    `;
  }

  // Get nearby farms based on current location
  async getNearbyFarms(radius: number = 50): Promise<GhanaFarmLocation[]> {
    // This would typically fetch from a database
    // For now, return sample farms near user location
    const userLoc = this.userLocation || { lat: 5.6037, lng: -0.1870 };
    
    return this.getSampleFarms().filter(farm => {
      const distance = this.calculateDistance(
        userLoc.lat, userLoc.lng,
        farm.coordinates.lat, farm.coordinates.lng
      );
      return distance <= radius;
    });
  }

  // Calculate distance between two points in kilometers
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get sample farms (would be replaced with database query)
  private getSampleFarms(): GhanaFarmLocation[] {
    return [
      {
        id: '1',
        name: 'Green Valley Cocoa Farm',
        region: 'Ashanti',
        district: 'Kumasi Metropolitan',
        coordinates: { lat: 6.6885, lng: -1.6244 },
        farmType: 'Cocoa Plantation',
        cropTypes: ['cocoa', 'plantain'],
        soilType: 'Forest ochrosols',
        areaSize: 25.5,
        waterSource: ['rainfall', 'stream'],
        accessibility: 'good'
      },
      {
        id: '2',
        name: 'Northern Grain Collective',
        region: 'Northern',
        district: 'Tamale Metropolitan',
        coordinates: { lat: 9.4034, lng: -0.8424 },
        farmType: 'Grain Farm',
        cropTypes: ['maize', 'millet', 'sorghum'],
        soilType: 'Savanna ochrosols',
        areaSize: 45.0,
        waterSource: ['borehole', 'rainfall'],
        accessibility: 'excellent'
      },
      {
        id: '3',
        name: 'Palm Coast Plantation',
        region: 'Western',
        district: 'Sekondi-Takoradi Metropolitan',
        coordinates: { lat: 4.8960, lng: -1.7525 },
        farmType: 'Oil Palm Estate',
        cropTypes: ['oil palm', 'rubber'],
        soilType: 'Forest oxysols',
        areaSize: 120.0,
        waterSource: ['rainfall', 'river'],
        accessibility: 'excellent'
      }
    ];
  }

  // Get regions list
  getRegions(): GhanaRegionInfo[] {
    return this.ghanaRegions;
  }

  // Get region by name
  getRegionByName(name: string): GhanaRegionInfo | undefined {
    return this.ghanaRegions.find(region => region.name === name);
  }

  // Search for locations within Ghana
  async searchLocation(query: string): Promise<google.maps.places.PlaceResult[]> {
    if (!this.map) {
      console.error('Map not initialized');
      return [];
    }

    return new Promise((resolve) => {
      const service = new google.maps.places.PlacesService(this.map!);
      
      const request = {
        query: `${query} Ghana`,
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(4.5, -3.3), // SW corner of Ghana
          new google.maps.LatLng(11.2, 1.3)  // NE corner of Ghana
        )
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          console.error('Places search failed:', status);
          resolve([]);
        }
      });
    });
  }

  // Clear all markers
  clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  // Focus map on specific region
  focusOnRegion(regionName: string): void {
    const region = this.getRegionByName(regionName);
    if (region && this.map) {
      this.map.setCenter(region.coordinates);
      this.map.setZoom(9);
    }
  }

  // Get current map center
  getMapCenter(): { lat: number; lng: number } | null {
    if (!this.map) return null;
    const center = this.map.getCenter();
    return center ? { lat: center.lat(), lng: center.lng() } : null;
  }
}

const ghanaLocationService = new GhanaLocationService();
export default ghanaLocationService;
