import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LocationData {
  device_id: string;
  device_type: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface DeviceData {
  device_id: string;
  device_type: string;
  created_at?: string;
}

export async function upsertDevice(deviceId: string, deviceType: string) {
  try {
    const deviceData: DeviceData = {
      device_id: deviceId,
      device_type: deviceType,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('devices')
      .upsert([deviceData], { 
        onConflict: 'device_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Device registration error:', error);
      return { success: false, error: error.message };
    }

    console.log('Device registered successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Device registration network error:', error);
    return { success: false, error: 'Network error during device registration' };
  }
}

export async function sendLocationToSupabase(locationData: LocationData) {
  try {
    const { data, error } = await supabase
      .from('location_data')
      .insert([locationData]);

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('Location sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'Network error' };
  }
}