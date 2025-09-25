/*
  # Create new schema with devices and locations tables

  1. New Tables
    - `devices`
      - `id` (uuid, primary key, auto-generated)
      - `imei` (text, unique, not null) - Device IMEI identifier
      - `name` (text, not null) - Device name
      - `client_id` (uuid, nullable) - Reference to client
      - `is_active` (boolean, default true) - Device status
      - `created_at` (timestamp) - When device was created
      - `updated_at` (timestamp) - When device was last updated

    - `locations`
      - `id` (uuid, primary key, auto-generated)
      - `device_id` (uuid, foreign key to devices.id)
      - `latitude` (float8, not null) - GPS latitude
      - `longitude` (float8, not null) - GPS longitude
      - `accuracy` (float8, nullable) - GPS accuracy in meters
      - `speed` (float8, nullable) - Speed in km/h
      - `timestamp` (timestamptz, not null) - Location timestamp
      - `created_at` (timestamptz, default now()) - Record creation time

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations

  3. Cleanup
    - Drop old location_data table if it exists
    - Drop old devices table if it exists (from previous migration)
*/

-- Drop old tables if they exist
DROP TABLE IF EXISTS location_data CASCADE;
DROP TABLE IF EXISTS devices CASCADE;

-- Create devices table
CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imei text UNIQUE NOT NULL,
  name text NOT NULL,
  client_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  latitude float8 NOT NULL,
  longitude float8 NOT NULL,
  accuracy float8,
  speed float8,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Policies for devices table
CREATE POLICY "Allow all operations on devices" ON devices
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for locations table
CREATE POLICY "Allow all operations on locations" ON locations
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_devices_imei ON devices(imei);
CREATE INDEX idx_devices_created_at ON devices(created_at);
CREATE INDEX idx_locations_device_id ON locations(device_id);
CREATE INDEX idx_locations_timestamp ON locations(timestamp);
CREATE INDEX idx_locations_created_at ON locations(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_devices_updated_at 
    BEFORE UPDATE ON devices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();