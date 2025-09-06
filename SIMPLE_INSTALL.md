# Simple Phone Installation Guide

## What You Need
- A computer (Windows, Mac, or Linux)
- Your phone
- Internet connection
- A Supabase account (free)

## Step 1: Set Up Database (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project" 
3. Sign up with your email
4. Click "New Project"
5. Give it any name (like "phone-tracker")
6. Wait for it to finish setting up
7. Click on "SQL Editor" on the left side
8. Copy and paste this code, then click "RUN":

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

ALTER TABLE location_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON location_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for all users" ON location_data
  FOR SELECT USING (true);
```

9. Click on "Settings" → "API" 
10. Copy the "Project URL" and "anon public" key - save these somewhere!

## Step 2: Install Node.js (2 minutes)

1. Go to https://nodejs.org
2. Download the version that says "Recommended for Most Users"
3. Install it (just keep clicking "Next")
4. Restart your computer

## Step 3: Install Expo Tools (2 minutes)

1. Open Command Prompt (Windows) or Terminal (Mac)
2. Type this and press Enter:
```
npm install -g @expo/cli eas-cli
```
3. Wait for it to finish

## Step 4: Configure the App (1 minute)

1. In the `.env` file, replace:
   - `YOUR_SUPABASE_URL` with your Project URL from Step 1
   - `YOUR_SUPABASE_ANON_KEY` with your anon key from Step 1

## Step 5A: Quick Test (Easiest - 2 minutes)

1. Install "Expo Go" app on your phone from App Store or Google Play
2. In Command Prompt/Terminal, type: `npm run dev`
3. A QR code will appear
4. Open Expo Go app and scan the QR code
5. The app will open on your phone
6. Grant location permissions when asked

**Note: This method is just for testing. The app won't work when you close it.**

## Step 5B: Real Installation (Takes 10-30 minutes)

### For Android:

1. Create Expo account at https://expo.dev
2. In Command Prompt/Terminal, type: `eas login`
3. Enter your Expo account details
4. Type: `eas build --platform android --profile preview`
5. Wait 10-30 minutes for it to build
6. You'll get a link to download an APK file
7. Download the APK to your phone
8. Install it (you may need to allow "Install from unknown sources")

### For iPhone:

1. You need an Apple Developer account ($99/year)
2. Same steps as Android but use: `eas build --platform ios --profile preview`
3. You'll get an IPA file that you can install through TestFlight

## Step 6: Use the App

1. Open the app on your phone
2. Grant location permissions when asked
3. The app will automatically start sending your location every 2 minutes
4. You can see the status in the app

## Troubleshooting

**App not working?**
- Make sure you updated the `.env` file with your real Supabase details
- Check that location permissions are granted
- Make sure you have internet connection

**Can't install APK?**
- Go to Settings → Security → Allow installation from unknown sources

**Build failed?**
- Make sure you're logged into Expo: `eas login`
- Try again, sometimes it just fails randomly

## Checking if it Works

1. Go back to your Supabase project
2. Click "Table Editor" → "location_data"
3. You should see location data appearing every 2 minutes

That's it! Your phone is now a location transmitter.