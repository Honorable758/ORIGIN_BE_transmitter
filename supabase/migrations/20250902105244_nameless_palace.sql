/*
  # Create devices table

  1. New Tables
    - `devices`
      - `device_id` (text, primary key) - Unique identifier for each device
      - `device_type` (text, not null) - Type of device identifier (e.g., 'generated_uuid', 'imei')
      - `created_at` (timestamp) - When the device was first registered
      - `updated_at` (timestamp) - When the device was last seen

  2. Security
    - Enable RLS on `devices` table
    - Add policy for inserting new devices
    - Add policy for reading device data

  3. Indexes
    - Primary key index on device_id for fast lookups
*/

CREATE TABLE IF NOT EXISTS devices (
  device_id text PRIMARY KEY,
  device_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON devices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for all users" ON devices
  FOR SELECT USING (true);

CREATE POLICY "Allow update for all users" ON devices
  FOR UPDATE USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at);