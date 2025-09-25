import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { getOrCreateDeviceId } from '../../utils/deviceId';
import { sendLocationToSupabase, LocationData, upsertDevice } from '@/lib/supabase';

export default function TransmitterScreen() {
  const mounted = useRef(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [transmissionStatus, setTransmissionStatus] = useState('idle');
  const [deviceId, setDeviceId] = useState('');
  const [supabaseDeviceId, setSupabaseDeviceId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const requestPermissionsAndGetLocation = async () => {
    if (!mounted.current) return;
    
    try {
      console.log('🔍 Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        if (mounted.current) {
          setPermissionStatus('denied');
        }
        Alert.alert('Location permission denied', 'Please enable location access in settings');
        return;
      }

      if (mounted.current) {
        setPermissionStatus('granted');
      }
      
      console.log('📍 Getting current position...');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      if (!mounted.current) return;
      
      setLocation(loc);
      setLastUpdate(new Date().toLocaleTimeString());
      setUpdateCount(prev => prev + 1);
      
      // Send to Supabase
      setTransmissionStatus('sending');
      
      const currentDeviceId = deviceId || await getOrCreateDeviceId();
      
      // Update state if we just got the device ID
      if (!deviceId && mounted.current) {
        setDeviceId(currentDeviceId);
      }
      
      // Register device if we don't have a Supabase device ID yet
      let currentSupabaseDeviceId = supabaseDeviceId;
      if (!currentSupabaseDeviceId) {
        console.log('📱 Registering device with IMEI:', currentDeviceId);
        const deviceName = `Transmitter-${currentDeviceId.substring(0, 8)}`;
        const deviceResult = await upsertDevice(currentDeviceId, deviceName);
        
        if (!deviceResult.success || !deviceResult.data?.id) {
          if (mounted.current) {
            setTransmissionStatus('error');
          }
          console.error('❌ Failed to register device:', deviceResult.error);
          Alert.alert('Device Registration Error', `Failed to register device: ${deviceResult.error}`);
          return;
        }
        
        console.log('✅ Device registered successfully. Supabase ID:', deviceResult.data.id);
        currentSupabaseDeviceId = deviceResult.data.id;
        
        if (mounted.current) {
          setSupabaseDeviceId(currentSupabaseDeviceId);
        }
      }
      
      const locationData: LocationData = {
        device_id: currentSupabaseDeviceId,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || undefined,
        speed: loc.coords.speed || undefined,
        timestamp: new Date().toISOString(),
      };

      console.log('📡 Sending location data:', locationData);
      const result = await sendLocationToSupabase(locationData);
      console.log('📊 Supabase result:', result);
      
      if (!mounted.current) return;
      
      if (result.success) {
        setTransmissionStatus('success');
        console.log('✅ Location sent successfully');
      } else {
        setTransmissionStatus('error');
        console.error('❌ Failed to send location:', result.error);
        Alert.alert('Database Error', `Failed to save location: ${result.error}`);
      }
      
      // Reset status after 3 seconds
      setTimeout(() => {
        if (mounted.current) {
          setTransmissionStatus('idle');
        }
      }, 3000);
      
    } catch (error) {
      console.error('Location error:', error);
      if (mounted.current) {
        setTransmissionStatus('error');
      }
      Alert.alert('Error getting location', (error as Error).message);
    }
  };

  // Initialize device ID and start location tracking
  useEffect(() => {
    const initialize = async () => {
      if (!mounted.current) return;
      
      console.log('🚀 Initializing app...');
      const id = await getOrCreateDeviceId();
      
      if (mounted.current) {
        setDeviceId(id);
      }
      
      if (!mounted.current) return;
      
      // Get initial location
      await requestPermissionsAndGetLocation();
      
      if (!mounted.current) return;
      
      // Start automatic updates every minute
      intervalRef.current = setInterval(() => {
        if (mounted.current) {
          requestPermissionsAndGetLocation();
        }
      }, 60000);
    };

    initialize();
  }, []);

  const getStatusColor = () => {
    switch (transmissionStatus) {
      case 'sending': return '#ffaa00';
      case 'success': return '#00ff88';
      case 'error': return '#ff4444';
      default: return '#888';
    }
  };

  const getStatusText = () => {
    switch (transmissionStatus) {
      case 'sending': return 'Sending to Supabase...';
      case 'success': return 'Sent successfully!';
      case 'error': return 'Failed to send';
      default: return 'Ready';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blackeye Transmitter</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>
          Location: {permissionStatus === 'checking' ? 'Checking permissions...' : 
                    permissionStatus === 'denied' ? 'Permission denied' : 
                    'Auto-updating every minute'}
        </Text>
        
        <Text style={[styles.transmissionStatus, { color: getStatusColor() }]}>
          Transmission: {getStatusText()}
        </Text>
      </View>

      {deviceId ? (
        <Text style={styles.deviceId}>Device ID: {deviceId}</Text>
      ) : null}
      
      {supabaseDeviceId ? (
        <Text style={styles.deviceId}>Supabase ID: {supabaseDeviceId}</Text>
      ) : null}

      {updateCount > 0 ? (
        <Text style={styles.updateInfo}>
          Updates: {updateCount} | Last: {lastUpdate}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={requestPermissionsAndGetLocation}>
        <Text style={styles.buttonText}>Manual Update & Send</Text>
      </TouchableOpacity>

      {location ? (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Lat: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Lng: {location.coords.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Accuracy: {location.coords.accuracy?.toFixed(1)}m
          </Text>
          <Text style={styles.locationText}>
            Time: {new Date(location.timestamp).toLocaleString()}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#00ff88',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginBottom: 20,
  },
  status: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  transmissionStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deviceId: {
    color: '#888',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
  updateInfo: {
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00ff88',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationInfo: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
});