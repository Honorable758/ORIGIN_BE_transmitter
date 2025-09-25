import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LocationData {
  device_id: string; // This will be the UUID from the 'devices' table
  latitude: number;
  longitude: number;
  accuracy?: number; // Optional, matches schema
  speed?: number;     // Optional, matches schema
  timestamp: string;
}

// Function to upsert a device based on IMEI
// Returns the full device object from Supabase, including its generated 'id'
export async function upsertDevice(imei: string, name: string): Promise<{ success: boolean; data?: { id: string, imei: string, name: string } | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .upsert(
        { 
          imei, 
          name, 
          client_id: null, // Explicitly set to null for anon upserts
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'imei' } // Use imei for conflict resolution as it's unique
      )
      .select('id, imei, name') // Select the fields we need, especially the generated 'id'
      .single(); // Expect a single record back

    if (error) {
      console.error('Device upsert error:', error);
      return { success: false, error: error.message };
    }

    console.log('Device upserted successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Device upsert network error:', error);
    return { success: false, error: 'Network error during device upsert: ' + error.message };
  }
}

// Function to send location data to the 'locations' table
export async function sendLocationToSupabase(locationData: LocationData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('locations') // Correct table name
      .insert([
        {
          device_id: locationData.device_id,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          speed: locationData.speed,
          timestamp: locationData.timestamp,
          created_at: new Date().toISOString(), // Add created_at as per schema
        }
      ]);

    if (error) {
      console.error('Supabase location insert error:', error);
      return { success: false, error: error.message };
    }

    console.log('Location sent successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('Network error during location send:', error);
    return { success: false, error: 'Network error during location send: ' + error.message };
  }
}