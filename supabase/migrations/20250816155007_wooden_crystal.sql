/*
  # Add device_type column to location_data table

  1. Schema Changes
    - Add `device_type` column to `location_data` table
    - Set default value for existing records
    - Make column NOT NULL after setting defaults

  2. Data Migration
    - Update existing records to have a default device_type value
*/

-- Add the device_type column as nullable first
ALTER TABLE location_data 
ADD COLUMN IF NOT EXISTS device_type TEXT;

-- Update any existing records to have a default device_type
UPDATE location_data 
SET device_type = 'legacy_device' 
WHERE device_type IS NULL;

-- Now make the column NOT NULL
ALTER TABLE location_data 
ALTER COLUMN device_type SET NOT NULL;