import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export async function getOrCreateDeviceId() {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = Crypto.randomUUID(); // generate once using expo-crypto
      await AsyncStorage.setItem('device_id', deviceId);
      console.log("📱 New device_id generated:", deviceId);
    } else {
      console.log("📱 Existing device_id loaded:", deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("❌ Error handling device_id:", error);
    // Fallback to a simple random ID if AsyncStorage fails
    return 'device_' + Math.random().toString(36).substr(2, 9);
  }
}