# Blackeye Transmitter

A location tracking app that automatically transmits GPS coordinates to Supabase every 2 minutes.

## Features

- **Automatic transmission** - Starts automatically when app launches with valid configuration
- **Background operation** - Continues sending location data in the background
- **Device identification** - Uses IMEI or generates unique device ID
- **Real-time monitoring** - Status dashboard with transmission details
- **Configurable settings** - Adjustable intervals and database settings

## Installation on Phone

### Method 1: Development Build (Recommended)

1. **Install Expo CLI and EAS CLI**:
   ```bash
   npm install -g @expo/cli eas-cli
   ```

2. **Configure the app**:
   - Update `.env` file with your Supabase credentials
   - Modify `app.json` if needed (app name, bundle identifier)

3. **Build for your device**:
   ```bash
   # For Android
   eas build --platform android --profile preview
   
   # For iOS (requires Apple Developer account)
   eas build --platform ios --profile preview
   ```

4. **Install the APK/IPA**:
   - Download the build from the EAS dashboard
   - Install on your device

### Method 2: Expo Go (Development Only)

1. **Install Expo Go** on your phone from App Store/Play Store

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Scan QR code** with Expo Go app

*Note: Some features like background location may be limited in Expo Go*

### Method 3: Local Development Build

1. **Install Android Studio** (for Android) or **Xcode** (for iOS)

2. **Create development build**:
   ```bash
   npx expo install expo-dev-client
   npx expo run:android  # or expo run:ios
   ```

## Setup Instructions

### 1. Supabase Database Setup

Create a table named `location_data` with the following schema:

```sql
CREATE TABLE location_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  accuracy FLOAT8 NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE location_data ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting data
CREATE POLICY "Allow insert for all users" ON location_data
  FOR INSERT WITH CHECK (true);

-- Create policy for reading data
CREATE POLICY "Allow read for all users" ON location_data
  FOR SELECT USING (true);
```

### 2. Environment Configuration

Update the `.env` file with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ivfxivscfhaqajzdqmsh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnhpdnNjZmhhcWFqemRxbXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTUxMjIsImV4cCI6MjA3MDMzMTEyMn0.D4OPmVxkqAxOyt64MVr9aoIGkXuRejtefoU_Rz9-Oec
### 3. Permissions

The app will request the following permissions:
- **Location (Foreground)** - Required for GPS tracking
- **Location (Background)** - Required for continuous operation
- **Internet** - Required for data transmission

## Usage

1. **Launch the app** - Transmission starts automatically if configured
2. **Monitor status** - Check the Status tab for transmission details
3. **Adjust settings** - Use Settings tab to modify configuration
4. **Background operation** - App continues working when minimized

## Data Structure

Each location transmission includes:
- `device_id`: IMEI or unique identifier
- `device_type`: 'imei' or 'phone_number'
- `latitude`: GPS latitude coordinate
- `longitude`: GPS longitude coordinate
- `accuracy`: GPS accuracy in meters
- `timestamp`: ISO timestamp of location reading

## Troubleshooting

### App not transmitting automatically
- Check `.env` file has valid Supabase credentials
- Ensure location permissions are granted
- Verify internet connection
- Check Settings tab for auto-start toggle

### Location not updating
- Enable high accuracy GPS in device settings
- Ensure app has background location permission
- Check if battery optimization is disabled for the app

### Database connection issues
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure database table exists with correct schema

## Production Deployment

For production use:
1. Create production Supabase project
2. Update environment variables
3. Build signed APK/IPA
4. Distribute to target devices
5. Configure device settings for optimal background operation

## Security Notes

- Supabase credentials are stored in environment variables
- Location data is transmitted over HTTPS
- Consider implementing device authentication for production use
- Review Row Level Security policies for your use case