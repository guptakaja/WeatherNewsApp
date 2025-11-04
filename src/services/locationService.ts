import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const locationService = {
  /**
   * Request location permission from user
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      console.log('🔐 Requesting location permission...');
      
      if (Platform.OS === 'android') {
        // Check if already granted
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (hasPermission) {
          console.log('✅ Fine location permission already granted');
          return true;
        }
        
        // Request fine location permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Precise Location Required',
            message: 'This app needs your exact GPS location in Hyderabad to show accurate weather and local news. Please select "Precise" location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow Precise Location',
          }
        );
        
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log(`Fine location permission: ${granted} (${isGranted ? 'granted' : 'denied'})`);
        
        // Also request coarse location as backup
        if (isGranted) {
          const coarseGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          );
          console.log(`Coarse location permission: ${coarseGranted}`);
        }
        
        return isGranted;
      }
      
      // For iOS, permissions are handled in Info.plist and at runtime
      console.log('📱 iOS - location permission handled by system');
      return true;
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      return false;
    }
  },

  /**
   * Get current live GPS location coordinates - TEMPORARY: Using Hyderabad coordinates
   */
  async getCurrentLocation(): Promise<LocationCoords> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔍 Getting location for Hyderabad...');
        
        // TEMPORARY FIX: Use Hyderabad coordinates since emulator GPS might not work properly
        // TODO: Replace with real GPS when testing on physical device
        console.log('🔧 TEMPORARY: Using Hyderabad coordinates for testing');
        const hyderabadCoords = {
          latitude: 17.3850,
          longitude: 78.4867,
        };
        console.log(`🎯 Using Hyderabad location: ${hyderabadCoords.latitude}, ${hyderabadCoords.longitude}`);
        console.log(`✅ Location is in India (Hyderabad, Telangana)`);
        
        // Simulate a slight delay to mimic GPS acquisition
        setTimeout(() => {
          resolve(hyderabadCoords);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Location service error:', error);
        reject(new Error(`Location service failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  },

  /**
   * Watch location changes (for future use)
   */
  watchLocation(callback: (location: LocationCoords) => void): number {
    return Geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1000, // Update every 1km
        interval: 30000, // Update every 30 seconds
      }
    );
  },

  /**
   * Stop watching location
   */
  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  },
};